import { PrismaClient, MatchStatus } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

// What the local backend computes (local timezone)
const localToday = new Date(); localToday.setHours(0,0,0,0);
const localTomorrow = new Date(localToday); localTomorrow.setDate(localTomorrow.getDate()+1);
console.log('Local today window :', localToday.toISOString(), '→', localTomorrow.toISOString());

// What a UTC backend computes
const now = new Date();
const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const utcTomorrow = new Date(utcToday); utcTomorrow.setUTCDate(utcTomorrow.getUTCDate()+1);
console.log('UTC   today window :', utcToday.toISOString(), '→', utcTomorrow.toISOString());

const live = await prisma.match.findMany({
  where:  { status: { in: [MatchStatus.LIVE, MatchStatus.HALFTIME] } },
  select: { id: true, status: true, minute: true, kickoff_at: true,
            home_team: { select: { name: true } }, away_team: { select: { name: true } } },
});
console.log('\nLIVE in DB:');
for (const m of live) console.log(' -', m.home_team.name, 'vs', m.away_team.name, '|', m.status, 'min', m.minute, '| kickoff', m.kickoff_at.toISOString());

const localMatches = await prisma.match.findMany({
  where:  { kickoff_at: { gte: localToday, lt: localTomorrow } },
  select: { id: true, status: true, kickoff_at: true,
            home_team: { select: { name: true } }, away_team: { select: { name: true } } },
  orderBy: { kickoff_at: 'asc' },
});
console.log('\nToday matches (LOCAL window) count:', localMatches.length);
for (const m of localMatches) console.log(' -', m.home_team.name, 'vs', m.away_team.name, '|', m.status, '| kickoff', m.kickoff_at.toISOString());

const utcMatches = await prisma.match.findMany({
  where:  { kickoff_at: { gte: utcToday, lt: utcTomorrow } },
  select: { id: true, status: true, kickoff_at: true,
            home_team: { select: { name: true } }, away_team: { select: { name: true } } },
  orderBy: { kickoff_at: 'asc' },
});
console.log('\nToday matches (UTC window) count:', utcMatches.length);
for (const m of utcMatches) console.log(' -', m.home_team.name, 'vs', m.away_team.name, '|', m.status, '| kickoff', m.kickoff_at.toISOString());

await prisma.$disconnect();
