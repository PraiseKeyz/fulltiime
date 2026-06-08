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

## 5. The tab system

**Everything is a tab** — Summary, Line-ups, Stats, and the **Narrative**. The phase
config decides, for each phase:

1. **which tabs exist** — each tab has a `when(data)` predicate; if its data is
   absent the tab simply does not render (no empty boxes),
2. **their order**,
3. **which one is the default** (opens first).

### Tab catalogue

| Tab | `when` predicate (renders only if…) | Notes |
|---|---|---|
| **Narrative** | always | Label changes: "Preview" (pre) / "Report" (post) / "Info" (disrupted) |
| **Summary** | events exist OR live | Live event feed / match timeline |
| **Line-ups** | lineups exist | ~1h before kickoff onward |
| **Stats** | any stat present | Possession, shots, xG… |
| **H2H** *(later)* | h2h data exists | Bucket B — backend not built yet |
| **Form** *(later)* | form data exists | Bucket B — backend not built yet |
| **Standings** *(optional)* | standings exist for league | Context table |

### Tab matrix (order shown left→right, **bold = default**)

| Phase | Tabs |
|---|---|
| **TBD** | **Preview** |
| **UPCOMING** | **Preview**, *(H2H)*, *(Form)*, *(Standings)* |
| **LIVE** | **Summary**, Line-ups, Stats, Report |
| **FINISHED** | **Summary**, Line-ups, Stats, Report |
| **POSTPONED** | **Info**, *(Standings)* |
| **CANCELLED** | **Info** |
| **ABANDONED** | **Summary**, Line-ups, Stats, Report *(whatever partial data exists)* |

*(parenthesised tabs appear only once their Bucket B data lands — see §7)*

### The narrative tab — "constant but de-prioritised for live"

The narrative is present in **every** phase, always below the hero, always as a tab.
What changes is its **prominence**:

- **Quiet phases** (TBD, UPCOMING, CANCELLED, POSTPONED): narrative is the
  **default** tab and sits **first** — it carries the page.
- **Busy phases** (LIVE, FINISHED, ABANDONED): **Summary** is default; the narrative
  ("Report") is still a tab, just **demoted** — not default, placed after the live data.

So a user on a live game lands on the live feed; the preview/report is one click away.

---

## 6. Rail — per phase

| Phase | Slot 1 | Slot 2 |
|---|---|---|
| **TBD** | Venue | Other ties in this round |
| **UPCOMING** | Venue | Matchday fixtures *(or standings)* |
| **LIVE** | Venue | Other live games |
| **FINISHED** | Venue | League standings |
| **DISRUPTED** | Venue | Other fixtures in the matchday/round |

Venue is always slot 1 so the rail stays visually anchored across phases.

---

## 7. Data buckets — what we can build now vs later

**Bucket A — data we already have** (build fully now):
teams · logos · kickoff · venue · events · line-ups · formations · stats ·
standings · round fixtures / bracket ties.

**Bucket B — data we do NOT pull yet** (design the slot, fill later):
- **Form** — each team's last 5 results
- **Head-to-head** — past meetings between the two teams
- **Live text commentary** — minute-by-minute written feed

Because tabs are data-driven (`when` predicate), Bucket B tabs **just don't appear
until their data exists**. No flags, no empty states — they materialise when the
backend lands. This keeps the engine unblocked by backend work.

---

## 8. The config shape (target architecture)

```ts
type Phase =
  | 'tbd' | 'upcoming' | 'live' | 'finished'
  | 'postponed' | 'cancelled' | 'abandoned'

interface TabDef {
  key: string
  label: (data) => string          // "Preview" | "Report" | "Info"
  when: (data) => boolean           // data-presence predicate
  render: (data) => ReactNode
}

interface PhaseConfig {
  header: (data) => ReactNode       // hero center renderer
  tabs: TabDef[]                     // candidate tabs, in order
  defaultTab: string                // which opens first
  rail: [RailSlot, RailSlot]        // slot 1 = venue (constant), slot 2 = phase
}

const CONFIG: Record<Phase, PhaseConfig>
```

The page becomes "dumb": `phase = getMatchPhase(data)` → look up `CONFIG[phase]` →
render hero + (tabs filtered by `when`) + rail. New phase or tab = one config entry.

---

## 9. Build order (proposed)

1. **`getMatchPhase(data)`** — the single discriminant (+ aggregate detection).
2. **Phase config scaffolding** — `CONFIG` map + the dumb page that reads it.
3. **Hero center renderers** — per phase (reuse existing countdown/score code).
4. **Tab engine** — dynamic tabs with `when` predicates, order, default; URL-synced
   (keep current `?tab=` behaviour).
5. **Narrative tab** — phase-aware label + prominence (default vs demoted).
6. **Migrate existing tabs** (Summary / Line-ups / Stats) into the engine.
7. **Rail slot 2** per phase.
8. **DISRUPTED** flavours (postponed / cancelled / abandoned).
9. **Aggregates** for two-legged ties (header center variation).
10. *(Later — Bucket B)* backend for Form + H2H → tabs auto-appear.

---

## 10. Out of scope (for this pass)

- Bucket B backend (Form, H2H, commentary) — slots designed, data later.
- Odds / betting.
- Player profile deep-links from line-ups.
</content>
