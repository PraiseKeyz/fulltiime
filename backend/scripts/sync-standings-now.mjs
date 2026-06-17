/**
 * One-off: sync standings for all active leagues from SportMonks → DB.
 * Run with:
 *   DATABASE_URL=... SPORTMONKS_API_KEY=... node scripts/sync-standings-now.mjs
 */
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const API_KEY = process.env.SPORTMONKS_API_KEY;

async function fetchAll(path) {
  const base = `https://api.sportmonks.com/v3/football${path}&api_token=${API_KEY}`;
  const first = await fetch(base).then(r => r.json());
  let data = first.data ?? [];
  const lastPage = first.pagination?.last_page ?? 1;
  for (let p = 2; p <= lastPage; p++) {
    const more = await fetch(`${base}&page=${p}`).then(r => r.json());
    data = data.concat(more.data ?? []);
  }
  return data;
}

function parseDetails(details) {
  const codeOf = d =>
    String(d.type?.developer_name ?? d.type?.code ?? d.type?.name ?? '')
      .toLowerCase().replace(/[\s_]+/g, '-');
  const pick = match => {
    const row = details.find(d => match(codeOf(d)));
    const v = row?.value;
    return typeof v === 'number' ? v : Number(v) || 0;
  };
  const overall = c => !c.includes('home') && !c.includes('away');
  return {
    played:       pick(c => overall(c) && (c.includes('played') || c.includes('matches') || c.includes('games'))),
    won:          pick(c => overall(c) && (c.includes('won') || c.includes('win'))),
    drawn:        pick(c => overall(c) && c.includes('draw')),
    lost:         pick(c => overall(c) && (c.includes('lost') || c.includes('lose'))),
    goalsFor:     pick(c => overall(c) && (c.includes('scored') || (c.includes('goal') && c.includes('for')))),
    goalsAgainst: pick(c => overall(c) && (c.includes('conceded') || (c.includes('goal') && c.includes('against')))),
  };
}

const leagues = await prisma.league.findMany({
  where: { is_active: true },
  include: { seasons: { where: { is_current: true }, take: 1 } },
});

for (const league of leagues) {
  const season = league.seasons[0];
  if (!season?.sportmonks_id) continue;

  console.log(`Syncing ${league.name}...`);
  try {
    const rows = await fetchAll(`/standings/seasons/${season.sportmonks_id}?include=participant;details.type;group`);
    if (!rows.length) { console.log(`  (no rows)`); continue; }

    let upserted = 0;
    for (const row of rows) {
      const teamId = row.participant_id ?? row.participant?.id;
      const team = await prisma.team.findUnique({ where: { api_football_id: teamId } });
      if (!team) continue;

      const s = parseDetails(row.details ?? []);
      const data = {
        position:      row.position,
        played:        s.played,
        won:           s.won,
        drawn:         s.drawn,
        lost:          s.lost,
        goals_for:     s.goalsFor,
        goals_against: s.goalsAgainst,
        goal_diff:     s.goalsFor - s.goalsAgainst,
        points:        row.points ?? 0,
        form:          row.form ?? null,
        group:         row.group?.name ?? null,
      };

      await prisma.standing.upsert({
        where:  { season_id_team_id: { season_id: season.id, team_id: team.id } },
        update: data,
        create: { season_id: season.id, team_id: team.id, ...data },
      });
      upserted++;
    }
    console.log(`  ✓ ${upserted} rows upserted`);
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
  }
}

await prisma.$disconnect();
console.log('\nDone.');
