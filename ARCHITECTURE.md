# Fulltiime — Architecture & Flow

---

## 1. System overview

```mermaid
flowchart TB
    user([User / Browser])

    subgraph edge[Nginx reverse proxy]
        direction LR
        d1[fulltiime.com → Coming Soon]
        d2[beta.fulltiime.com → App]
        d3[api.fulltiime.com → Backend]
    end

    subgraph fe[Frontend · Next.js 16 · :3000]
        pages[App Router pages]
        rq[(React Query cache)]
        api_client[lib/api client]
        pages --> rq --> api_client
    end

    subgraph be[Backend · NestJS · :5000]
        controllers[REST controllers /api/v1]
        services[Services]
        sync[Sync cron jobs]
        cachesvc[CacheService]
        controllers --> services
        services --> cachesvc
    end

    db[(PostgreSQL)]
    sm[[SportMonks API v3]]

    user --> edge
    edge --> fe
    api_client -- HTTP --> controllers
    services -- Prisma --> db
    cachesvc -- Prisma --> db
    sync -- pull --> sm
    services -- on-demand pull --> sm
    sync -- write --> db
```

**Key idea:** the frontend never talks to SportMonks directly. The backend syncs
SportMonks into Postgres on a schedule; pages read from our DB through the API.
A few slow-changing things (brackets, match previews) are fetched on demand and
cached in a DB table.

---

## 2. Data sync pipeline

SportMonks data is pulled by scheduled cron jobs and stored in our DB. Pages then
read from the DB, so reads are fast and don't depend on SportMonks being up.

```mermaid
flowchart LR
    subgraph cron[Sync cron jobs]
        L[syncLeagues · daily 2am]
        T[syncTeams · Mon 3am]
        V[syncVenues · Mon 4am]
        F[syncFixtures · every 6h]
        S[syncStandings · daily 2am]
        Live[syncLiveScores · every 5m]
    end

    sm[[SportMonks]]

    subgraph pg[(PostgreSQL)]
        leagues[(leagues + seasons)]
        teams[(teams)]
        venues[(venues)]
        matches[(matches)]
        standings[(standings)]
    end

    L --> sm --> leagues
    T --> sm --> teams
    V --> sm --> venues
    F --> sm --> matches
    S --> sm --> standings
    Live --> sm --> matches

    leagues -. order matters .-> teams -.-> venues -.-> matches -.-> standings
```

- **Dynamic leagues:** `syncLeagues` pulls whatever's in the SportMonks
  subscription — no hardcoded IDs. Leagues dropped from the plan are marked
  `is_active=false`.
- **Live scores** (every 5 min) carry events, lineups and stats via includes, so
  one call refreshes everything for in-play matches.
- **Venues** only sync for `domestic` + `cup_international` competitions (the
  global qualifiers reference hundreds of venues and aren't surfaced).

---

## 3. A read request (with the two cache layers)

```mermaid
sequenceDiagram
    participant B as Browser
    participant RQ as React Query
    participant API as Backend API
    participant DB as PostgreSQL
    participant SM as SportMonks

    B->>RQ: useQuery(...)
    alt fresh in RQ cache (staleTime 2m)
        RQ-->>B: cached data (instant)
    else stale / missing
        RQ->>API: GET /api/v1/...
        API->>DB: Prisma query
        DB-->>API: rows
        API-->>RQ: { success, data, ... }
        RQ-->>B: render
    end

    Note over API,SM: Passthrough data (bracket / preview)
    API->>DB: cache table lookup
    alt cache fresh (TTL)
        DB-->>API: payload
    else miss / stale
        API->>SM: fetch once
        SM-->>API: data
        API->>DB: upsert into cache
    end
```

- **Frontend (React Query):** `staleTime 2m`, `gcTime 30m`, `keepPreviousData`,
  `refetchOnWindowFocus:false` → instant revisits, no skeleton flash, live data
  still polls via `refetchInterval`.
- **Backend (DB cache):** see §4.

---

## 4. DB-backed cache (`CacheService.getOrSet`)

Used for slow-changing passthrough data (knockout **brackets**, placeholder
**match previews**) so SportMonks is hit at most once per key per TTL — shared
across users and server instances, and surviving restarts.

```mermaid
flowchart TD
    req[Request for key] --> look{Cache row exists<br/>and not expired?}
    look -- yes --> hit[Return stored payload<br/>· one cheap DB read]
    look -- no --> fetch[Run fetcher → SportMonks]
    fetch --> store[Upsert payload + expires_at]
    store --> ret[Return value]
```

| Data | Key | TTL |
|---|---|---|
| Knockout bracket | `bracket:<leagueId>` | 12h |
| Match preview | `preview:<fixtureId>` | 6h |

---

## 5. Match detail resolution

A match link can carry **our cuid** (real synced match) or a **SportMonks fixture
id** (a bracket tie). Placeholder knockout ties aren't in our DB, so they resolve
to a cached preview.

```mermaid
flowchart TD
    start[GET /fixtures/:id] --> cuid{Found by cuid?}
    cuid -- yes --> full[Return full match<br/>+ lazy-load detail if live/finished]
    cuid -- no --> isnum{id is numeric?<br/>SportMonks fixture id}
    isnum -- no --> nf[404 Not found]
    isnum -- yes --> byapi{Found by<br/>api_football_id?}
    byapi -- yes --> full
    byapi -- no --> prev[Build cached PREVIEW<br/>slots · venue · round fixtures]
    prev --> previewpage[Frontend renders preview layout]
    full --> matchpage[Frontend renders full match layout]
```

Both render in the **same two-column shell** (header + tabs on the left, venue +
round/competition fixtures on the right) — only the content differs.

---

## 6. Domain model (core entities)

```mermaid
erDiagram
    COUNTRY ||--o{ LEAGUE : has
    COUNTRY ||--o{ TEAM : has
    LEAGUE  ||--o{ SEASON : has
    SEASON  ||--o{ MATCH : has
    SEASON  ||--o{ STANDING : has
    TEAM    ||--o{ MATCH : "home/away"
    TEAM    ||--o{ STANDING : in
    VENUE   ||--o{ MATCH : hosts
    MATCH   ||--o{ MATCH_EVENT : has
    MATCH   ||--o{ MATCH_LINEUP : has
    MATCH   ||--o{ MATCH_STATISTIC : has
    USER    }o--o{ TEAM : favourites
    USER    }o--o{ LEAGUE : favourites

    LEAGUE {
        string id PK
        int sportmonks_id "api_football_id"
        string name
        string sub_type "domestic / cup_international / international"
        bool is_active
    }
    MATCH {
        string id PK
        int sportmonks_id
        enum status
        int home_score
        int away_score
        string venue_id FK
    }
    STANDING {
        int position
        int points
        string group "Group A..L for cups"
    }
    VENUE {
        int capacity
        string surface
        string image_url
    }
    CACHE {
        string key PK
        json payload
        datetime expires_at
    }
```

> Brackets are **not** stored relationally — they're a passthrough fetched from
> SportMonks (stages + edges DAG) and cached in the `CACHE` table.

---

## 7. Deployment

```mermaid
flowchart LR
    dev[git push main] --> ci[GitHub Actions]
    ci --> build[Build + push images<br/>to Docker Hub]
    ci --> ssh[SSH into server]
    ssh --> compose[docker compose pull + up]
    compose --> server[(VPS · Nginx + Postgres<br/>+ frontend + backend containers)]
```

- `NEXT_PUBLIC_*` vars are **baked at build time** (build args); backend secrets
  are injected at **runtime** via docker-compose `environment`.
- Secrets come from **GitHub Actions secrets**, exported on the server during deploy.
```
