import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { LlmService } from './llm.service.js';

// ─── Match chat — signed-in fans asking about THIS fixture ──────────────────
//
// Deliberately the last piece of the AI build (spec §9): a chatbox only has
// something real to reason from once grounded match data exists. Stateless by
// design — the client holds the conversation, we just ground each reply in
// real facts (+ whatever LLM-authored phase-text already exists, our richest
// grounded prose for this fixture). No persistence, no moderation surface.

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const CHAT_INCLUDE = {
  home_team: { select: { name: true, short_name: true } },
  away_team: { select: { name: true, short_name: true } },
  season:    { include: { league: { select: { name: true } } } },
  venue_ref: { select: { name: true, city: true } },
} as const;

@Injectable()
export class MatchChatService {
  private readonly logger = new Logger(MatchChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm:    LlmService,
  ) {}

  async reply(matchId: string, messages: ChatMessage[]): Promise<string | null> {
    const match = await this.prisma.match.findUnique({
      where:   { id: matchId },
      include: CHAT_INCLUDE,
    });
    if (!match) throw new NotFoundException('Match not found');

    const system = await this.buildSystemPrompt(match);
    const reply  = await this.llm.chat({ system, messages, maxTokens: 400 });
    if (!reply) this.logger.warn(`No chat reply generated for match ${matchId}`);
    return reply;
  }

  private async buildSystemPrompt(match: any): Promise<string> {
    const home   = match.home_team.name;
    const away   = match.away_team.name;
    const league = match.season?.league?.name ?? 'an unknown competition';
    const venue  = match.venue_ref?.name ?? match.venue ?? null;
    const when   = new Date(match.kickoff_at).toLocaleString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    });

    const facts: string[] = [
      `Competition: ${league}`,
      `Fixture: ${home} vs ${away}`,
      `Kickoff: ${when}`,
    ];
    if (venue) facts.push(`Venue: ${venue}`);
    if (match.status !== 'SCHEDULED') {
      facts.push(`Status: ${match.status}`);
      if (match.home_score != null && match.away_score != null) {
        const minute = match.minute != null ? ` (minute ${match.minute})` : '';
        facts.push(`Score: ${home} ${match.home_score}–${match.away_score} ${away}${minute}`);
      }
    }

    // The richest grounded prose we have for this fixture — fold it in verbatim
    // so the assistant's answers stay consistent with what the page itself says.
    const text = await this.prisma.matchText.findFirst({ where: { match_id: match.id } });
    if (text) facts.push(`Editorial note already shown on this page: "${text.body.replace(/\s+/g, ' ').trim()}"`);

    return [
      `You are Fulltiime's assistant on the ${home} vs ${away} match page. Fans ask you questions about THIS fixture; answer using ONLY the facts below.`,
      '',
      'Facts:',
      ...facts.map((f) => `- ${f}`),
      '',
      'Rules:',
      '- Use only the facts above. Never invent stats, lineups, injuries, transfer news, historical results, quotes, or opinions not given to you.',
      "- If asked something you don't have facts for (other matches, odds, gossip, predictions, anything not listed), say plainly that you don't have that information — don't guess or speculate.",
      '- Keep replies short and conversational: 2-4 sentences.',
      '- Stay on topic — this chat is about this one match only.',
    ].join('\n');
  }
}
