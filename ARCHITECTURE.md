# Fulltiime — System Architecture

---

## 1. Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER / USER                           │
└───────────────────┬─────────────────────────────────────────────┘
                    │ visits beta.fulltiime.com
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                FRONTEND  (Next.js 16 App Router)                │
│                     runs on port 3000                           │
│                                                                 │
│   • Shows pages: Home, Matches, Standings, Competitions, etc.   │
│   • React Query fetches data from the Backend API               │
│   • No direct contact with the DB or API-Football               │
└───────────────────┬─────────────────────────────────────────────┘
                    │ HTTP requests to /api/v1/...
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                BACKEND  (NestJS)                                │
│                     runs on port 5000                           │
│                                                                 │
│   • REST API: /api/v1/fixtures, /leagues, /standings, etc.      │
│   • Reads data from PostgreSQL database                         │
│   • Runs background cron jobs to sync data from API-Football    │
└──────────┬────────────────────────────┬────────────────────────-┘
           │ Prisma ORM                 │ Axios HTTP calls
           ▼                            ▼
┌─────────────────────┐    ┌────────────────────────────────────┐
│    PostgreSQL DB     │    │   API-Football (external API)      │
│                      │    │   v3.football.api-sports.io        │
│  • leagues           │    │                                    │
│  • seasons           │    │   Free plan: seasons 2022–2024     │
│  • teams             │    │   Paid plan: current season + live │
│  • matches           │    └────────────────────────────────────┘
│  • match_statistics  │
│  • standings         │
│  • players           │
│  • users             │
│  • articles          │
└─────────────────────┘
```

---

## 2. Domain Routing (Nginx)

```
fulltiime.com        →  Coming Soon page  (middleware blocks main app)
beta.fulltiime.com   →  Full application  (Next.js app)
api.fulltiime.com    →  Backend API       (NestJS on port 5000)
```

---

## 3. Backend Data Sync (Cron Jobs)

API-Football data does NOT come in real time. The backend runs
scheduled jobs that pull data from the API and store it in the DB.
The frontend then reads from the DB — never from the API directly.

```
API-Football
     │
     │  Cron jobs (scheduled background tasks)
     │
     ├─── syncLeagues()    — runs daily at 2am
     │       Pulls league info + current season
     │       Saves to: leagues, seasons tables
     │
     ├─── syncTeams()      — runs every Monday at 3am
     │       Pulls all teams for each league
     │       Saves to: teams table
     │
     ├─── syncFixtures()   — runs every 6 hours
     │       Pulls upcoming matches (next 7 days)
     │       Saves to: matches table
     │       ⚠️  Requires PAID plan for 2025 season
     │
     ├─── syncLiveScores() — runs every 5 minutes
     │       Pulls all currently live matches
     │       Updates: score, minute, status in matches table
     │       Also syncs stats for the TOP priority live match
     │       Saves stats to: match_statistics table
     │
     └─── syncStandings()  — runs daily at 2am
             Pulls league table for each competition
             Saves to: standings table
```

**Dependency order matters:**
```
syncLeagues → syncTeams → syncFixtures → syncLiveScores
    (must run in this order on first setup)
```

Manual trigger (instead of waiting for cron):
```
POST /api/v1/sync/run   ← runs all 4 in sequence
```

---

## 4. How the Homepage Gets Its Data

```
Browser loads beta.fulltiime.com
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  HeroSection (featured match card)                          │
│  → calls GET /api/v1/fixtures/featured                      │
│                                                             │
│  Backend logic (findFeatured):                              │
│    1. Any LIVE matches in DB?                               │
│         YES → pick highest priority one:                    │
│                weight = league × 10 + goals × 2 + phase    │
│                UCL > PL > La Liga > Serie A > BUN > EL      │
│         NO  → next SCHEDULED match (soonest kickoff)        │
│         NO  → most recent FINISHED match                    │
│                                                             │
│  Returns: { match, type: "live" | "upcoming" | "finished" } │
│                                                             │
│  Frontend renders:                                          │
│    live     → score + minute + stats bars (if synced)       │
│    upcoming → countdown timer                               │
│    finished → final score + stats bars (if synced)          │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  ScoresStrip (horizontal scrolling match cards)             │
│  → calls GET /api/v1/fixtures/today                         │
│                                                             │
│  Returns all matches with kickoff today                     │
│  Frontend filters by league tab (All / PL / UCL / etc.)    │
│  Sorted: LIVE → HALFTIME → SCHEDULED → FINISHED             │
│  Refetches every 60 seconds automatically                   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  CompetitionsSection                                        │
│  → calls GET /api/v1/leagues                               │
│  Returns our 6 tracked leagues with real logos              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. API Response Format

Every backend response follows the same envelope:

```json
// Success
{
  "success": true,
  "message": "Request successful",
  "data": { ...actual data here... },
  "error": null,
  "timestamp": "2026-05-28T00:00:00.000Z"
}

// Error
{
  "success": false,
  "message": "Match not found",
  "data": null,
  "error": { "statusCode": 404, "type": "NotFoundException" },
  "timestamp": "2026-05-28T00:00:00.000Z"
}
```

The frontend API client automatically unwraps `data` so React Query
hooks receive the actual data directly, not the envelope.

---

## 6. The 6 Leagues We Track

| ID  | League           | Short | Sync Weight |
|-----|-----------------|-------|-------------|
| 2   | Champions League | UCL   | 6 (highest) |
| 39  | Premier League   | PL    | 5           |
| 140 | La Liga          | LL    | 4           |
| 135 | Serie A          | SA    | 3           |
| 78  | Bundesliga       | BUN   | 2           |
| 3   | Europa League    | EL    | 1 (lowest)  |

---

## 7. Current Limitation (Free API Plan)

```
Free plan  →  seasons 2022–2024 only  →  no live data
Paid plan  →  current 2025 season    →  live scores + stats

To get real live data: upgrade API-Football plan, set
API_FOOTBALL_SEASON=2025 in backend/.env
```

For now the pipeline is fully built. Once you upgrade:
1. Change `API_FOOTBALL_SEASON=2025` in `.env`
2. Run `POST /api/v1/sync/run` to populate the DB
3. Live scores update automatically every 5 minutes
4. Hero section picks the best live match automatically
