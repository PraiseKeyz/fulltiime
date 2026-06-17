import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const API_KEY = process.env.SPORTMONKS_API_KEY;

async function fetchSM(path) {
  const url = `https://api.sportmonks.com/v3/football${path}&api_token=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SportMonks ${res.status}: ${url}`);
  const json = await res.json();
  let data = json.data ?? [];
  let meta = json.pagination ?? json.meta?.pagination;
  let page = 1;
  while (meta && page < (meta.last_page ?? 1)) {
    page++;
    const r2 = await fetch(`${url}&page=${page}`);
    const j2 = await r2.json();
    data = data.concat(j2.data ?? []);
    meta = j2.pagination ?? j2.meta?.pagination;
  }
  return data;
}

const league = await prisma.league.findFirst({
  where: { name: { contains: 'World Cup', mode: 'insensitive' } },
  include: { seasons: { where: { is_current: true }, take: 1 } },
});
const season = league.seasons[0];
console.log(`League: ${league.name} | Season: ${season?.year} | SM id: ${season?.sportmonks_id}\n`);

// ── DB ────────────────────────────────────────────────────────────────────────
const dbRows = await prisma.standing.findMany({
  where: { season_id: season.id, group: { in: ['Group F', 'Group G'] } },
  include: { team: { select: { name: true } } },
  orderBy: [{ group: 'asc' }, { position: 'asc' }],
});
console.log('── DB (Group F & G) ──────────────────────────────────────');
for (const r of dbRows) {
  console.log(`  ${r.group} #${r.position} ${r.team.name.padEnd(22)} P=${r.played} W=${r.won} D=${r.drawn} L=${r.lost} GF=${r.goals_for} GA=${r.goals_against} Pts=${r.points}`);
}

// ── SportMonks live ───────────────────────────────────────────────────────────
console.log('\n── SportMonks live (Group F & G) ────────────────────────');
const smRows = await fetchSM(`/standings/seasons/${season.sportmonks_id}?include=participant;details.type;group`);
const relevant = smRows.filter(r => ['Group F', 'Group G'].includes(r.group?.name));

if (!relevant.length) {
  const names = [...new Set(smRows.map(r => r.group?.name).filter(Boolean))].sort();
  console.log('  No Group F/G — all group names:', names.join(', '));
} else {
  // Print all developer_names from the first row so we can see what keys exist
  const firstRow = relevant[0];
  console.log('  [developer_names available in details:]');
  for (const d of firstRow.details ?? []) {
    console.log(`    ${d.type?.developer_name ?? '?'} = ${d.value}`);
  }
  console.log();

  relevant.sort((a, b) => (a.group?.name ?? '').localeCompare(b.group?.name ?? '') || a.position - b.position);
  for (const r of relevant) {
    const name = r.participant?.name ?? `team#${r.participant_id}`;
    const get = (...keys) => {
      for (const d of r.details ?? []) {
        const code = String(d.type?.developer_name ?? d.type?.code ?? d.type?.name ?? '').toLowerCase().replace(/[-_ ]/g, '');
        if (keys.some(k => code === k || code.includes(k))) return d.value ?? 0;
      }
      return '?';
    };
    const played = get('overallmatchesplayed', 'matchesplayed', 'played', 'overallgamesplayed', 'gamesplayed');
    const won    = get('overallwon', 'won');
    const drawn  = get('overalldraw', 'drawn', 'draw');
    const lost   = get('overalllost', 'lost');
    const gf     = get('overallgoalsscored', 'goalsscored', 'goalsfor');
    const ga     = get('overallgoalsagainst', 'goalsagainst');
    const pts    = get('overallpoints', 'points');
    console.log(`  ${r.group?.name} #${r.position} ${name.padEnd(22)} P=${played} W=${won} D=${drawn} L=${lost} GF=${gf} GA=${ga} Pts=${pts}`);
  }
}

await prisma.$disconnect();
