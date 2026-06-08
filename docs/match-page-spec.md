# Match Page — Phase-Driven Design Spec

> One match page. One layout. The **content adapts to the state of the game**.
> Nothing is hardcoded — we compute a single `phase` and everything flows from it.

---

## 1. Principle

The match page is currently full of scattered `if` checks (`'preview' in match`,
`status === 'SCHEDULED'`, `showCountdown`, empty-state branches). We replace all of
that with **one decision**:

```
getMatchPhase(data)  →  a single discriminant
```

Every region of the page is then a **pure function of `(phase, data)`**. The layout
never changes — only what fills the slots. Adding behaviour later = adding a config
entry, not a new `if`.

---

## 2. The phases

| Phase | Detection | Meaning |
|---|---|---|
| **TBD** | `'preview' in match` | Teams not known yet (knockout placeholder — "Winner Match 49 vs Winner Match 50") |
| **UPCOMING** | `status === 'SCHEDULED'` | Teams known, not kicked off |
| **LIVE** | `status === 'LIVE' \| 'HALFTIME'` | In progress now |
| **FINISHED** | `status === 'FINISHED'` | Played, has a result |
| **DISRUPTED** | `POSTPONED \| CANCELLED \| ABANDONED` | Did not / will not complete normally |

**DISRUPTED has three flavours** (same phase, different rendering):

| Flavour | Meaning | Data present? |
|---|---|---|
| POSTPONED | Will be replayed on a new date | None yet (like an upcoming game in limbo) |
| CANCELLED | Will never be played | None, ever |
| ABANDONED | Kicked off then stopped | **Partial** score + events (e.g. abandoned 60') |

> **TBD is the one true exception** in this whole spec: it shows a single
> **Preview** tab and *nothing else* (no Comments, no Table) — there's no real
> match yet, just a placeholder bracket slot. Every other phase follows the
> common rules below.

---

## 3. The layout (constant for every phase)

```
┌─────────────────────────────────────┬──────────────┐
│  HERO  (header card — phase center)  │  VENUE CARD  │  ← rail slot 1 (always)
│                                      │              │
│  [ TAB BAR ]   ← dynamic per phase   │  RAIL SLOT 2 │  ← changes per phase
│  TAB CONTENT                         │              │
└─────────────────────────────────────┴──────────────┘
```

Only **two regions** ever change: the **hero center** and the **tab system**.
The rail is stable: **venue is always slot 1**, slot 2 swaps per phase.

---

## 4. Hero center — per phase

| Phase | Hero center shows |
|---|---|
| **TBD** | "vs" + slot labels (`W QF1`, `1A`) + stage + "Date TBC" |
| **UPCOMING** | **Countdown** to kickoff + "Until kick-off" |
| **LIVE** | **Live score** (red) + pulsing minute badge |
| **FINISHED** | **Final score** + "FULL TIME" |
| **POSTPONED** | "vs" + amber **POSTPONED** badge; original date greyed; new date if known |
| **CANCELLED** | "vs" + muted-red **CANCELLED** badge; original date struck through |
| **ABANDONED** | Partial score + **ABANDONED** badge + "stopped at 60'" |

**Two-legged ties (aggregate):** when a fixture is part of a two-legged tie, the hero
center gains a second line — `agg. 2–1` under the score, plus `First leg: 1–1`.
Applies to LIVE (running aggregate) and FINISHED second legs.

---

## 5. All match text is LLM-authored — generated once, cached forever

This is the single biggest shift from the first pass of this spec: **every piece
of narrative prose on the match page — Preview, Overview copy, About, Report,
Info — is written by an LLM, not assembled from templates.** Templated text
(`match-narrative.ts` in the first build) reads as robotic and doesn't scale to
the richness FotMob-style pages need. An LLM, grounded in the real match data,
can write naturally — and that same grounded text becomes the seed context for
the AI chatbox later (see §9).

**Generation rule — "generate once, lock it in":**
- The text is generated **a single time**, at the moment its content is final for
  that phase (e.g. the *preview* is written once the fixture/teams are confirmed;
  the *report* is written once the match finishes).
- It's saved to the **database** and served from there on every subsequent load —
  exactly like the existing `Cache.getOrSet` pattern for brackets/previews, just
  durable rather than TTL'd (the content won't change once the phase has settled).
- This keeps the cost bounded: **one LLM call per match per phase-text**, not per
  page view. Thousands of reads, one write.

This generalises and *replaces* the original `getNarrative()` template function —
the tab still renders the same way, but its text now comes from a DB-backed fetch
(grounded generation) instead of a pure string-builder.

---

## 6. The tab system

**Tabs are still data-driven** — the phase config decides which tabs exist, their
order, and the default. Two new universal concepts join the catalogue:

1. **Comments** — a cross-cutting tab present on **every phase except TBD**.
   Public can *read* comments; only **signed-in users** can *post*. (See §7.)
2. **Overview / Table** — richer pre-match content for **UPCOMING**, modelled on
   FotMob: a combined preview (LLM text + last-XI/formation comparison) and a
   standings table relevant to the fixture.

### Tab catalogue

| Tab | Appears when… | Content source |
|---|---|---|
| **Preview** | TBD; also UPCOMING's narrative text | LLM-authored (§5) |
| **Overview** | UPCOMING (default tab) | LLM preview text **+** last-XI / formation comparison (last lineup & result per team) |
| **Table** | UPCOMING, when a relevant standings table exists (World Cup group stage; league standings where applicable) | Existing standings data, filtered to the relevant group/league |
| **Summary** | LIVE / FINISHED — events exist or live | Synced match events |
| **Line-ups** | confirmed XI exists for *this* fixture (~1h pre-match onward) | Synced lineups |
| **Stats** | any stat present | Synced match statistics |
| **About** | LIVE — narrative, demoted behind Summary | LLM-authored (§5) |
| **Report** | FINISHED — narrative | LLM-authored (§5) |
| **Info** | POSTPONED / CANCELLED — the only content tab | LLM-authored (§5) |
| **Comments** | every phase except TBD | New backend feature — see §7 |
| **H2H** *(next up)* | h2h data exists | SportMonks head-to-head endpoint — confirmed available |
| **Form** *(later)* | form data exists | Bucket B — backend not built yet |

### Tab matrix (order shown left→right, **bold = default**)

| Phase | Tabs |
|---|---|
| **TBD** | **Preview** *(only — no Comments, no Table; see §2 note)* |
| **UPCOMING** | **Overview**, Table, Line-ups *(once published)*, Comments |
| **LIVE** | **Summary**, Line-ups, Stats, About, Comments |
| **FINISHED** | **Summary**, Line-ups, Stats, Report, Comments |
| **POSTPONED** | **Info**, Comments |
| **CANCELLED** | **Info**, Comments |

### Narrative prominence — unchanged principle, new labels

- **Quiet phases** (TBD, UPCOMING, POSTPONED, CANCELLED): the narrative-bearing tab
  (**Preview** / **Overview** / **Info**) is the **default**, sitting first — it
  carries the page.
- **Busy phases** (LIVE, FINISHED): **Summary** is default; the narrative tab
  (**About** for live, **Report** for finished) is demoted to the end.

> **Why "About" and not "Preview" for live?** A match already underway isn't
> being "previewed" — "About" reads naturally for "context on this fixture while
> it's happening" without implying it hasn't started.

---

## 7. Comments — a new cross-cutting feature

A lightweight, match-scoped discussion thread.

- **Read:** open to everyone — including signed-out visitors.
- **Write:** **signed-in users only** — ties posting to an account, giving natural
  rate-limiting and traceable moderation without extra anti-abuse machinery.
- **Scope:** appears on every phase except TBD (no comments on a placeholder
  fixture with no real teams yet).

This needs genuinely new infrastructure (unlike most of this spec, which re-shapes
data we already have):
- **Backend:** a `MatchComment` model (matchId, userId, body, timestamps),
  endpoints to list (public) and create (authenticated), basic moderation hooks.
- **Frontend:** a comment list + composer, with the composer swapped for a
  "sign in to comment" prompt when logged out.

---

## 8. Rail — per phase

| Phase | Slot 1 | Slot 2 |
|---|---|---|
| **TBD** | Venue | Other ties in this round |
| **UPCOMING** | Venue | Rest of this competition's fixtures |
| **LIVE** | Venue | Other live games |
| **FINISHED** | Venue | Rest of this competition's fixtures |
| **DISRUPTED** | Venue | Rest of this competition's fixtures |

Venue is always slot 1 so the rail stays visually anchored across phases.

---

## 9. What's confirmed buildable now vs. genuinely later

**Build now — data we have, or is one small integration away:**
teams · logos · kickoff · venue · events · line-ups · formations · stats ·
standings/tables · round fixtures / bracket ties · **head-to-head** (SportMonks
v3 has a head-to-head fixtures endpoint — small, mechanical addition matching the
existing `sportmonks.service.ts` patterns) · **last-XI / form comparison**
(derivable from already-synced lineup + result data, plus one "last fixture" call
per team).

**Foundational new system — build deliberately, not deferred:**
- **LLM-authored match text** (§5) — replaces templated narrative across every
  phase. This is now the *engine*, not a nice-to-have: it feeds Preview, Overview,
  About, Report, and Info, and its grounded output becomes the context the AI
  chatbox (below) reasons from.
- **Comments** (§7) — new DB model + endpoints + auth-gated UI.

**Genuinely later — needs its own design pass:**
- **AI chatbox per match** — signed-in users only (cost/abuse control via auth).
  Deliberately sequenced *last*: it needs the LLM overview, H2H, and form data as
  grounding context, or it has nothing real to reason from and will hallucinate.
- **Live text commentary** — minute-by-minute feed; no backend yet.
- Two-legged aggregates, ABANDONED status — no data yet (see §2/§4 notes).

---

## 10. Build order (revised)

1. **Head-to-head** — new SportMonks call + `H2H` tab in the existing engine
   (smallest, most mechanical, immediate visible win).
2. **LLM text pipeline** — generation-on-lock + DB storage; replaces
   `match-narrative.ts`'s templates with grounded LLM output for
   Preview/Overview/About/Report/Info.
3. **Comments system** — backend model + endpoints, frontend tab (auth-gated
   posting, public reading), wired into every non-TBD phase.
4. **Overview & Table tabs (upcoming)** — last-XI/formation comparison component
   + group/league standings table, replacing the bare "Preview" default for
   upcoming matches.
5. **Last-XI / form comparison** — shared with #4; also informs Live/Finished
   if useful later.
6. **AI chatbox** — signed-in users only, grounded in #1/#2/#5's real data.

---

## 11. Out of scope (for this pass)

- Live text commentary — no backend yet.
- Odds / betting.
- Player profile deep-links from line-ups.
- FIFA-style external rankings (not in SportMonks; would need a new data source).
</content>
