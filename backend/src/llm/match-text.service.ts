import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { LlmService } from './llm.service.js';
import { MatchStatus, MatchTextKind } from '../../generated/prisma/index.js';

const LABELS: Record<MatchTextKind, string> = {
  PREVIEW:  'Preview',
  OVERVIEW: 'Overview',
  ABOUT:    'About',
  REPORT:   'Report',
  INFO:     'Info',
};

const TEXT_INCLUDE = {
  home_team: { select: { name: true, short_name: true } },
  away_team: { select: { name: true, short_name: true } },
  season:    { include: { league: { select: { name: true } } } },
  venue_ref: { select: { name: true, city: true } },
} as const;

// The fixed shape every match-text response is locked into — a lead line, a
// bulleted list of grounded specifics, and an optional closing note. Loosely
// inspired by FotMob's "About the match" rhythm, but built only from facts we
// actually have (no generic feature rundowns) — `body` is stored as this JSON,
// stringified, so the schema travels with the row forever.
export interface MatchTextBody {
  intro:      string;
  highlights: string[];
  closing?:   string;
}

const SYSTEM_PROMPT = `You write short editorial match notes for Fulltiime, a football match-coverage site.

Rules — follow these exactly:
- Use ONLY the facts given to you. Never invent stats, players, injuries, form, history, quotes, or storylines that aren't in the facts.
- Respond with ONLY a single JSON object — no markdown, no code fences, no text outside the JSON.
- The JSON must match this exact shape: {"intro": string, "highlights": string[], "closing": string | null}
- "intro": one or two sentences setting the scene — under 40 words.
- "highlights": 2 to 5 short bullet points, each grounded directly in the facts — under 25 words each. Don't pad with generic statements if the facts don't support more than two or three.
- "closing": one short closing line under 20 words, or null if you have nothing grounded to add.
- Do not use clichés ("all eyes will be on", "in what promises to be", "a blockbuster clash", etc).
- Tone: a knowledgeable beat reporter's note — concise and grounded, not hype copy.`;

@Injectable()
export class MatchTextService {
  private readonly logger = new Logger(MatchTextService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  async getOrGenerate(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where:   { id: matchId },
      include: TEXT_INCLUDE,
    });
    if (!match) return null;

    const kind = this.resolveKind(match.status);
    if (!kind) return null;

    const hit = await this.prisma.matchText.findUnique({
      where: { match_id_kind: { match_id: matchId, kind } },
    });
    if (hit) return this.shape(kind, hit.body);

    const parsed = await this.generate(match, kind);
    if (!parsed) return null;
    const body = JSON.stringify(parsed);

    // "Generate once, lock it in" — write-once via the unique constraint. If two
    // requests race, the loser's create fails; just re-read the winner's row.
    try {
      await this.prisma.matchText.create({ data: { match_id: matchId, kind, body } });
    } catch {
      const settled = await this.prisma.matchText.findUnique({
        where: { match_id_kind: { match_id: matchId, kind } },
      });
      if (settled) return this.shape(kind, settled.body);
    }

    return { kind, label: LABELS[kind], ...parsed };
  }

  // The match's current status maps 1:1 onto which phase-text is "final" right
  // now — by the time we ask for a REPORT the match IS finished, so there's no
  // separate readiness check needed; the kind itself encodes "this has settled".
  private resolveKind(status: MatchStatus): MatchTextKind | null {
    switch (status) {
      case MatchStatus.SCHEDULED:               return MatchTextKind.PREVIEW;
      case MatchStatus.LIVE:
      case MatchStatus.HALFTIME:
      case MatchStatus.INTERRUPTED:              return MatchTextKind.ABOUT;
      case MatchStatus.FINISHED:                return MatchTextKind.REPORT;
      case MatchStatus.POSTPONED:
      case MatchStatus.CANCELLED:               return MatchTextKind.INFO;
      default:                                  return null;
    }
  }

  private shape(kind: MatchTextKind, body: string) {
    const parsed = this.parseBody(body);
    if (!parsed) return null;
    return { kind, label: LABELS[kind], ...parsed };
  }

  // The model is asked for raw JSON but sometimes wraps it in ```json fences —
  // strip those before parsing, and validate the shape so a malformed response
  // never gets locked into the DB or handed to the frontend.
  private parseBody(raw: string): MatchTextBody | null {
    try {
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
      const obj = JSON.parse(cleaned);

      if (typeof obj.intro !== 'string' || !obj.intro.trim()) return null;
      if (!Array.isArray(obj.highlights) || !obj.highlights.every((h: unknown) => typeof h === 'string')) return null;

      const highlights = obj.highlights.map((h: string) => h.trim()).filter(Boolean);
      if (highlights.length === 0) return null;

      const closing = typeof obj.closing === 'string' && obj.closing.trim() ? obj.closing.trim() : undefined;
      return { intro: obj.intro.trim(), highlights, closing };
    } catch {
      return null;
    }
  }

  private async generate(match: any, kind: MatchTextKind): Promise<MatchTextBody | null> {
    const home   = match.home_team.name;
    const away   = match.away_team.name;
    const league = match.season?.league?.name ?? null;
    const venue  = match.venue_ref?.name ?? match.venue ?? null;
    const when   = new Date(match.kickoff_at).toLocaleString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
    });

    const facts: string[] = [
      `Competition: ${league ?? 'Unknown competition'}`,
      `Fixture: ${home} vs ${away}`,
      `Kickoff: ${when}`,
    ];
    if (venue) facts.push(`Venue: ${venue}`);

    let ask: string;
    switch (kind) {
      case MatchTextKind.PREVIEW:
        ask = `Write a brief preview of this upcoming fixture for the match page's "Preview" section.`;
        break;
      case MatchTextKind.ABOUT:
        facts.push(`Current score: ${home} ${match.home_score ?? 0}–${match.away_score ?? 0} ${away} (minute ${match.minute ?? '?'})`);
        ask = `The match is underway. Write a short note giving readers context on this fixture for the "About" section — what's at stake, not a live commentary (we show that separately).`;
        break;
      case MatchTextKind.REPORT:
        facts.push(`Final score: ${home} ${match.home_score ?? 0}–${match.away_score ?? 0} ${away}`);
        ask = `Write a brief match report based on the final result, for the "Report" section.`;
        break;
      case MatchTextKind.INFO: {
        const reason = match.status === MatchStatus.POSTPONED ? 'postponed' : 'cancelled';
        facts.push(`Status: ${reason}`);
        ask = `Write a brief, neutral note explaining that this fixture has been ${reason}, for the "Info" section. Don't speculate about why or when it might be rescheduled — we don't have that information.`;
        break;
      }
      default:
        return null;
    }

    const prompt = `${ask}\n\nFacts:\n${facts.map((f) => `- ${f}`).join('\n')}\n\nRespond with the JSON object only.`;
    const raw = await this.llm.generate({ system: SYSTEM_PROMPT, prompt, maxTokens: 400, json: true });
    if (!raw) return null;

    const parsed = this.parseBody(raw);
    if (!parsed) this.logger.warn(`Malformed JSON from LLM for match ${match.id} (${kind})`);
    return parsed;
  }
}
