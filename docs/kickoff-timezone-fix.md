# Kickoff Time Bug — Wrong "Live" State & Hour-Early Kickoffs

> Matches showed **"Live"** before they had started. Root cause: kickoff times were
> being stored **one hour early**, then the hero **guessed** live from the clock.
> Two bugs stacked on top of each other.

---

## 1. The symptom

A Mexico vs South Africa fixture scheduled for **8:00 PM WAT** displayed as **"Live"**
on the homepage hero at **7:38 PM** — 22 minutes *before* kickoff.

The backend status was correct the whole time (`SCHEDULED`). The bug was two separate
mistakes that combined:

| # | Layer | Mistake |
|---|---|---|
| **A** | Backend sync | Kickoff stored **1 hour early** (timezone parse) |
| **B** | Frontend hero | Inferred "live" from the **clock**, not the real status |

---

## 2. Bug A — kickoff stored an hour early (the root cause)

SportMonks returns datetimes as **timezone-less UTC strings**:

```
"2026-06-11 19:00:00"      // 8:00 PM WAT, expressed in UTC — but NO "Z"
```

The sync parsed them with a bare `new Date()`:

```ts
kickoff_at: new Date(fixture.starting_at)   // ❌
```

Because the string has **no timezone marker**, JavaScript parses it in the **machine's
local timezone**. On a UTC box that's fine. But the sync was run on a **WAT (UTC+1)**
dev machine, so:

```
new Date("2026-06-11 19:00:00")
  → interpreted as 19:00 WAT
  → stored as 18:00 UTC          // one hour too early
```

So the DB held `18:00:00Z` (= 7:00 PM WAT) for a match that actually kicks off at
8:00 PM WAT (`19:00:00Z`).

### The fix

Parse the timezone-less string **explicitly as UTC** so the server's timezone never
matters — [`sync.service.ts`](../backend/src/sync/sync.service.ts):

```ts
// SportMonks datetimes are UTC but carry no "Z". Force UTC parsing.
function smUtcDate(value: string): Date {
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasZone ? value : value.replace(' ', 'T') + 'Z');
}
```

Applied to every datetime parse in the sync: season start/end, fixture kickoff, and
team-form kickoff. `kickoff_at` was **also added to the fixtures `upsert` update block**
(it had been create-only), so:

- a re-sync **rewrites** the wrong rows already in the DB, and
- a **rescheduled** kickoff now updates instead of being frozen at its first value.

### Fixing rows already stored

Re-sync — **no manual SQL**:

```bash
curl -X POST https://<api-domain>/api/v1/sync/fixtures
```

This re-upserts the next 14 days of fixtures with the corrected UTC kickoff. The 6-hour
fixtures cron also self-heals it automatically after deploy.

> ⚠️ **Do not** run a blanket `UPDATE ... + interval '1 hour'`. Only rows synced on a
> non-UTC machine are wrong; rows synced on a UTC box are already correct, so a blanket
> shift would break those. Re-syncing rewrites each row from the source of truth, safely.

---

## 3. Bug B — the hero guessed "live" from the clock

The homepage hero was the **only** place in the app that inferred live state from time
instead of trusting the backend status — [`hero-card.tsx`](../frontend/components/home/hero/hero-card.tsx):

```ts
// ❌ old
function isMatchLive(match, diff) {
  return match.status === 'LIVE'
    || match.status === 'HALFTIME'
    || (match.status === 'SCHEDULED' && diff <= 0)   // "kickoff passed" ⇒ assume live
}
```

`diff = new Date(kickoff_at) - now`. Once the (hour-early) kickoff time passed, `diff`
went negative and the hero flashed **"Live"** — even though the status was still
`SCHEDULED`. Bug A fed Bug B.

### The fix

Trust the real backend status only — the same rule the rest of the app already uses
([`phase.ts`](../frontend/app/(main)/matches/[id]/_components/phase.ts), `match-hero.tsx`):

```ts
// ✅ new
function isMatchLive(match) {
  return match.status === 'LIVE' || match.status === 'HALFTIME'
}
```

The 2-minute live-scores cron keeps `status` current, so there's no need to guess.

---

## 4. Takeaways

- **Never `new Date()` a timezone-less string.** If a third party sends UTC without a
  `Z`, append one. The result must not depend on where the code runs.
- **One source of truth for "live."** State that exists in the data (`status`) should
  not be re-derived from the clock in one rogue component.
- **Upserts must update the fields that can change.** `kickoff_at` being create-only
  silently froze corrections (and reschedules).

---

## 5. Files touched

| File | Change |
|---|---|
| [`backend/src/sync/sync.service.ts`](../backend/src/sync/sync.service.ts) | `smUtcDate()` helper; UTC parsing at all 4 sites; `kickoff_at` added to fixtures `update` |
| [`frontend/components/home/hero/hero-card.tsx`](../frontend/components/home/hero/hero-card.tsx) | `isMatchLive` keys off real status only |
