---
description: Sportmonks Football API v3 integration rules
globs: ["**/*.ts", "**/*.js", "**/*.py", "**/*.go"]
---

# Sportmonks Football API v3

## Base URLs
- Football API: https://api.sportmonks.com/v3/football
- Core API: https://api.sportmonks.com/v3/core

## Authentication
Always pass the API token as a query parameter:
?api_token=process.env.SPORTMONKS_API_TOKEN

Never hardcode the token. Always read from environment variables.

## Includes
Pass as semicolon-separated string in the `include` query parameter:
?include=participants;scores;state;league

Common includes:
- participants: the two teams in a fixture
- scores: current and final scoreline
- state: match state (NS, LIVE, HT, FT, AET, PEN)
- league: league name and ID
- round: gameweek/matchday
- events: goals, cards, substitutions
- lineups: starting XI and bench
- statistics: team stats
- periods: half-time/full-time breakdown
- player: full player object (nest inside squad or lineup includes)
- position: player position

## Filters
Pass as key:value in the `filters` query parameter:
?filters=fixtureLeagues:8

Common filters:
- fixtureLeagues:{id} - filter fixtures by league
- fixtureStates:{id1,id2} - filter by match state
- seasonTopscorerTypes:{id} - filter topscorer category

## Pagination
Use `page` and `per_page` query parameters. Default per_page is 25.

## Key endpoints

### Search
GET /players/search/{query}
GET /teams/search/{query}
GET /leagues/search/{query}

### Players & Teams
GET /players/{id}?include=position;nationality;teams
GET /teams/{id}?include=venue;country
GET /leagues/{id}?include=country;seasons

### Squads
GET /squads/teams/{team_id}?include=player;position;detailedPosition
GET /squads/seasons/{season_id}/teams/{team_id}?include=player;position

### Fixtures
GET /fixtures/{id}?include=participants;scores;state;league
GET /fixtures/date/{date}?include=participants;scores;state
GET /fixtures/between/{start_date}/{end_date}
GET /fixtures/between/{start_date}/{end_date}/{team_id}
GET /fixtures/head-to-head/{team1_id}/{team2_id}
GET /livescores/inplay?include=participants;scores;state

### Standings
GET /standings/seasons/{season_id}?include=participant;details
GET /standings/live/leagues/{league_id}?include=participant;details

### Topscorers
GET /topscorers/seasons/{season_id}?include=player;participant&filters=seasonTopscorerTypes:208
Type IDs: goals=208, assists=209, yellow cards=84

### Odds
GET /odds/pre-match/fixtures/{fixture_id}?include=bookmaker;market
GET /odds/inplay/fixtures/{fixture_id}?include=bookmaker;market

## Response shape
All responses wrap data in a `data` key:
{ "data": { ... } } for single items
{ "data": [...], "pagination": { ... } } for lists

Always access response.data, not the response directly.

## Common league IDs
Premier League: 8
La Liga: 564
Bundesliga: 82
Serie A: 384
Ligue 1: 301
Champions League: 2
World Cup 2026: league_id=732, season_id=26618

## Error handling
- 401/403: invalid token or plan restriction
- 404: resource not found
- 429: rate limit exceeded - back off and retry
- Always handle these explicitly, never swallow errors silently

## Best practices
- Use the search endpoints to resolve names to IDs before fetching detail
- Request only the includes you need - each include adds to response size
- Cache league, season, and team IDs - they don't change
- For live apps, poll /livescores/inplay or /fixtures/date/{today} on a short interval