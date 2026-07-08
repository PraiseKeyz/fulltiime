// ─── Dummy editorial content, ported verbatim from the Fulltiime design ───────
//
// TEMPORARY data source. Every page reads content through the exports at the
// bottom of this file (SECTIONS, getSection, getStory, FEATURED_STORY, …) so
// swapping to the real backend later is a change to this module only.

import { hashString } from '@/lib/editorial'

export interface Insight {
  l: string
  t: string
}

export interface Story {
  slug: string
  kicker: string
  headline: string
  /** Standfirst / excerpt shown on cards and under the hero headline. */
  sub?: string
  author: string
  read: string
  hue: number
  /** Trending: "142 fans talking" */
  count?: string
  /** Trending: avatar hues */
  hues?: number[]
  /** Transfers: "Viktoria SC → Northgate Utd" */
  move?: string
  /** Transfers: crest initials */
  crest?: string
  /** Tactics: formation label for the pitch graphic */
  formation?: string
  /** Videos: duration "8:42" */
  dur?: string
  insights: Insight[]
  bodyHtml: string
}

// ─── Article generator (design `makeArticle`) ─────────────────────────────────

const AUTHORS = [
  'Lena Cardoso', 'Tom Reyes', 'Sofia Marin', 'Dani Okafor', 'Priya Anand',
  'Marcus Bell', 'Ada Eze', 'Kwame Boateng', 'Ifeoma Nadu',
]

const SHARED = {
  post: [
    'Watch it back without the commentary and the shape of the thing changes. The decisive moment was set up three passes earlier, in a run that never even touched the ball.',
  ],
  tail: [
    'By full time the numbers had tidied themselves up, the way they always do, and the table looked sensible again.',
    'But anyone who actually watched knows where this was settled — in the margins the models cannot see, long after most people had already written their conclusion.',
  ],
}

interface Bucket {
  lede: string
  subhead: string
  pull: string
  insights: Insight[]
  mid: string[]
}

const BUCKET: Record<string, Bucket> = {
  news: {
    lede: 'For all the noise that followed, the match itself told a quieter, stranger story than the timeline ever admitted.',
    subhead: 'What actually happened',
    pull: 'Football rewards the brave and punishes the certain — usually in that order.',
    insights: [
      { l: 'KEY STAT', t: 'The decisive goal arrived from the side’s third shot on target, and their first in 41 minutes. Efficiency, not dominance, settled this one.' },
      { l: 'TACTICAL', t: 'The winners spent long spells without the ball on purpose, inviting pressure so they could spring the space behind it.' },
      { l: 'BACKGROUND', t: 'This fixture has now produced a late winner in four of the last five meetings — a rivalry that refuses to end quietly.' },
    ],
    mid: [
      'There was a version of this game that finished goalless and forgotten. It existed for about an hour, until a single decision turned the whole thing on its head.',
    ],
  },
  transfer: {
    lede: 'Strip away the fee, the medical and the announcement video, and a transfer is really just a bet on a version of a player that does not exist yet.',
    subhead: 'Why the fee makes sense',
    pull: 'You don’t sign a player. You sign a bet on who they might still become.',
    insights: [
      { l: 'KEY STAT', t: 'The deal ranks among the club’s five biggest ever — but spread across the contract, the annual cost sits comfortably mid-table for the squad.' },
      { l: 'TACTICAL', t: 'The signing only works if the system bends to it: a front line built to feed runs, not feet.' },
      { l: 'BACKGROUND', t: 'Two recruitment staff pushed this through against real internal scepticism. Their last contrarian call became a club-record sale.' },
    ],
    mid: [
      'On paper it makes no sense. That is usually the first sign that someone in the building can see something the spreadsheet cannot.',
    ],
  },
  tactics: {
    lede: 'Tactics are not chalkboards and arrows. They are arguments about space — who takes it, who gives it up, and who is brave enough to leave it empty.',
    subhead: 'Read the space, not the ball',
    pull: 'Systems don’t win matches. They give brave players permission to.',
    insights: [
      { l: 'KEY STAT', t: 'The side completed just 38% of their passes in the final third — low by possession standards, but each one bought a runner half a yard.' },
      { l: 'TACTICAL', t: 'The key movement is the centre-forward dropping deep to drag a marker out, opening the channel a winger attacks at full pace.' },
      { l: 'BACKGROUND', t: 'This shape was dismissed as a gimmick two seasons ago. Three of the league’s top sides now run a version of it.' },
    ],
    mid: [
      'The beauty of it is how boring it looks until it works. Then, for one moment, the pitch tilts and an entire defensive structure folds like wet cardboard.',
    ],
  },
  cup: {
    lede: 'A World Cup never reads the script it is handed. Group stages are written in pencil, and the tournament spends a month rubbing them out.',
    subhead: 'A tournament rewriting itself',
    pull: 'The World Cup never reads the script. That is the entire point of it.',
    insights: [
      { l: 'KEY STAT', t: 'Host advantage is real but shrinking: co-host nations have cleared the group stage less often this cycle than in any tournament in two decades.' },
      { l: 'TACTICAL', t: 'Heat and altitude are flattening the high press. Teams happy to hoard the ball and control tempo are quietly thriving.' },
      { l: 'BACKGROUND', t: 'Three host nations, multiple time zones and a brutal travel map have turned squad depth into the most underrated asset of all.' },
    ],
    mid: [
      'The favourites are still the favourites. But this tournament has a way of finding the one team nobody bothered to book hotels for.',
    ],
  },
  africa: {
    lede: 'This is not a regional story filed under “elsewhere.” It is identity football — the kind that shapes how a whole continent sees itself on a Saturday.',
    subhead: 'Identity, not just results',
    pull: 'This was never a regional story. It is the story, and it always was.',
    insights: [
      { l: 'KEY STAT', t: 'Domestic-league graduates are reaching Europe younger than ever — the pipeline is widening at the base, not just the top.' },
      { l: 'TACTICAL', t: 'The best sides here marry street-honed individualism with ruthless transitional structure. It is not either/or.' },
      { l: 'BACKGROUND', t: 'For many readers this is not coverage of a far-off league. It is home — and it is written that way here, not as a footnote.' },
    ],
    mid: [
      'Europe keeps discovering players it could have watched for free three years earlier. The talent was never hidden. The attention was simply pointed elsewhere.',
    ],
  },
  human: {
    lede: 'Somewhere behind every result is a person who has to drive home afterwards and be someone’s parent, partner, or patient.',
    subhead: 'The person behind the player',
    pull: 'Long after the whistle, this is the part nobody actually forgets.',
    insights: [
      { l: 'KEY STAT', t: 'Careers in the top flight average under a decade. The story here is mostly about what comes before and after that narrow window.' },
      { l: 'TACTICAL', t: 'Form is rarely just fitness. The biggest performance variable in this story happened entirely off the pitch.' },
      { l: 'BACKGROUND', t: 'The events here unfold over years, not ninety minutes — which is exactly why the scoreboard never told the real story.' },
    ],
    mid: [
      'The football is almost incidental. It is the frame around a more stubborn, human picture that refuses to resolve cleanly.',
    ],
  },
}

function pickBucket(seed: string): Bucket {
  const t = seed.toLowerCase()
  let b = 'news'
  if (/transfer|£|move|signing|bench|loan|homecoming|replac|gamble/.test(t)) b = 'transfer'
  if (/tactic|formation|press|false nine|throw|defend|shape|ball/.test(t)) b = 'tactics'
  if (/world cup|group|host|altitude|underdog|time zone/.test(t)) b = 'cup'
  if (/npfl|super eagle|africa|naija|lagos|continental|aba|afcon|enyimba|eagle/.test(t)) b = 'africa'
  if (/human|hospital|town|prodigy|scout|finished|thirty|coach/.test(t)) b = 'human'
  return BUCKET[b]
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’'".,?!:—·]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface RawStory {
  kicker?: string
  tag?: string
  headline: string
  sub?: string
  hook?: string
  author?: string
  read?: string
  hue?: number
  count?: string
  hues?: number[]
  move?: string
  crest?: string
  formation?: string
  dur?: string
}

function makeStory(raw: RawStory): Story {
  const h = hashString(raw.headline)
  const seed = `${raw.tag ?? ''} ${raw.kicker ?? ''} ${raw.move ?? ''} ${raw.headline}`
  const bucket = pickBucket(seed)
  const intro = `The headline writes itself — ${raw.headline.replace(/[.”“"]+$/, '')} — but the story that matters starts underneath it.`

  const paragraphs = [
    bucket.lede,
    intro,
    ...bucket.mid,
    `<h2>${esc(bucket.subhead)}</h2>`,
    ...SHARED.post,
    `<blockquote>“${esc(bucket.pull)}”</blockquote>`,
    ...SHARED.tail,
  ]
  const bodyHtml = paragraphs
    .map((p) => (p.startsWith('<') ? p : `<p>${esc(p)}</p>`))
    .join('\n')

  return {
    slug: slugify(raw.headline),
    kicker: raw.kicker ?? raw.tag ?? (raw.move ? 'TRANSFER' : 'FULLTIIME'),
    headline: raw.headline,
    sub: raw.sub ?? raw.hook,
    author: raw.author ?? AUTHORS[h % AUTHORS.length],
    read: raw.read ?? `${5 + (h % 12)} min`,
    hue: raw.hue ?? h % 360,
    count: raw.count,
    hues: raw.hues,
    move: raw.move,
    crest: raw.crest,
    formation: raw.formation,
    dur: raw.dur,
    insights: bucket.insights,
    bodyHtml,
  }
}

// ─── Design content ───────────────────────────────────────────────────────────

export const FEATURED_STORY = makeStory({
  kicker: 'THE BIG READ · WORLD CUP 2026',
  headline: 'The Tournament That Refused To Behave',
  sub: 'Three host nations, one chaotic group stage, and a sport quietly rewriting its own rules in real time.',
  author: 'Lena Cardoso',
  read: '9 min',
  hue: 152,
})

export const SECONDARY_STORIES = [
  { kicker: 'NEWS', headline: "Northgate's Gamble Finally Has a Name", author: 'Tom Reyes', read: '6 min', hue: 162 },
  { kicker: 'TACTICS', headline: 'Why Nobody Wants the Ball Anymore', author: 'Sofia Marin', read: '5 min', hue: 120 },
  { kicker: 'LONG-FORM', headline: 'He Was Supposed To Be Finished', author: 'Dani Okafor', read: '7 min', hue: 84 },
].map(makeStory)

export const TRENDING_STORIES = [
  { tag: 'HOT', headline: 'Was That a Penalty? The Internet Has Decided.', count: '142 fans talking', hues: [20, 200, 300, 80], hue: 18 },
  { tag: 'FINAL', headline: 'The Substitution That Lost the Final', count: '318 fans talking', hues: [150, 40, 260, 110], hue: 200 },
  { tag: 'GK', headline: 'Nobody Is Talking About the Goalkeeper', count: '97 fans talking', hues: [90, 300, 40, 180], hue: 96 },
  { tag: 'TACTICS', headline: 'This Formation Should Not Work', count: '203 fans talking', hues: [260, 120, 30, 210], hue: 268 },
  { tag: 'BENCH', headline: 'The Kid Off the Bench Changed Everything', count: '256 fans talking', hues: [40, 160, 300, 90], hue: 44 },
].map(makeStory)

export const AFRICA_STORIES = [
  { tag: 'NPFL', hook: "Why the league's most feared side stopped chasing stars and started building one.", headline: "Enyimba's Quiet Dynasty Is Being Built in Aba", hue: 150 },
  { tag: 'SUPER EAGLES', hook: 'Three generations of number nines, one stubborn question nobody wants to answer.', headline: 'The Eagles Have a Striker Problem No One Will Name', hue: 128 },
  { tag: 'AFCON', hook: 'Inside the tournament Europe keeps underestimating — and the players who make it sing.', headline: "AFCON Doesn't Need Saving. It Needs Believing.", hue: 44 },
  { tag: 'CONTINENTAL', hook: 'The Lagos-to-Europe pipeline the big scouts pretend they discovered first.', headline: 'From a Street Pitch in Lagos to a European Bench', hue: 96 },
].map(makeStory)

export const WORLDCUP_STORIES = [
  { kicker: 'STORYLINE', headline: 'The Group of Death Is Already Dead', hue: 148 },
  { kicker: 'HOSTS', headline: 'One City, Three Time Zones, Zero Sleep', hue: 200 },
  { kicker: 'UNDERDOG', headline: 'The Underdog Nobody Booked Hotels For', hue: 96 },
  { kicker: 'THE EDGE', headline: 'Heat, Altitude, and the Science of Survival', hue: 40 },
].map(makeStory)

export const PREMIER_STORIES = [
  { kicker: 'MATCHDAY', headline: 'Northgate Blink First in the Title’s Cruellest Week', hue: 210 },
  { kicker: 'TITLE RACE', headline: 'Two Points, Six Games, One Nervous City', hue: 150 },
  { kicker: 'OPINION', headline: 'Stop Calling It a Crisis. It’s Just December.', hue: 32 },
].map(makeStory)

export const CHAMPIONS_STORIES = [
  { kicker: 'GROUP STAGE', headline: 'The Group Nobody Survives Intact', hue: 265 },
  { kicker: 'TACTICAL', headline: 'How to Strangle a Superclub in 20 Minutes', hue: 202 },
  { kicker: 'UPSET', headline: 'The Debutants Who Didn’t Read the Script', hue: 110 },
].map(makeStory)

export const LALIGA_STORIES = [
  { kicker: 'EL CLÁSICO', headline: 'The Clásico Has Stopped Pretending to Be Friendly', hue: 18 },
  { kicker: 'TACTICAL', headline: 'Real Montaña’s Midfield Is a Magic Trick', hue: 300 },
  { kicker: 'OPINION', headline: 'La Liga Doesn’t Miss the Galácticos. You Do.', hue: 96 },
].map(makeStory)

export const VIDEO_FEATURED = makeStory({
  kicker: 'TACTICS · FILM ROOM',
  headline: 'Inside the Press That Strangled the Champions League Holders',
  dur: '8:42',
  hue: 266,
})

export const VIDEO_STORIES = [
  { kicker: 'WORLD CUP', headline: 'The Goal That Broke the Internet, Frame by Frame', dur: '4:12', hue: 202 },
  { kicker: 'BEYOND', headline: '60 Seconds That Defined a Whole Career', dur: '2:03', hue: 38 },
].map(makeStory)

export const TRANSFER_STORIES = [
  { crest: 'NU', move: 'Viktoria SC → Northgate Utd', headline: 'The £60m Bet on a Player Who Hates the Ball', sub: "Northgate didn't buy a striker. They bought a system.", hue: 160 },
  { crest: 'RM', move: 'AFC Calder → Real Montaña', headline: 'A Homecoming Disguised as a Transfer', sub: "The move makes no tactical sense. That's the point.", hue: 30 },
  { crest: 'WB', move: 'Free Agent → Westbrook', headline: 'The Veteran Signing Everyone Mocked', sub: "Six months later, nobody's laughing.", hue: 264 },
  { crest: 'VS', move: 'Lindholm → Viktoria SC', headline: 'Replacing a Legend Is a Trap. He Walked In Anyway.', sub: 'Why the numbers quietly say this works.', hue: 108 },
].map(makeStory)

export const TACTICS_STORIES = [
  { kicker: 'BREAKDOWN', formation: '4-3-3', headline: 'The False Nine Is Back. It Never Left.' },
  { kicker: 'BREAKDOWN', formation: '5-2-3', headline: 'How To Defend Without Defenders' },
  { kicker: 'SET PIECE', formation: 'THROW-IN', headline: 'The Throw-In Is the New Set Piece' },
  { kicker: 'PRESSING', formation: '4-2-3-1', headline: 'Pressing Is Easy. Stopping Is the Hard Part.' },
].map(makeStory)

export const LONGFORM_STORIES = [
  { kicker: 'BEYOND', headline: 'The Goalkeeper Who Coached From a Hospital Bed', sub: 'A season ending, a career beginning, and the bench that became a lifeline.', author: 'Priya Anand', read: '14 min', hue: 140 },
  { kicker: 'BEYOND', headline: 'A Town, a Team, and the Match That Saved Both', sub: 'When the factory closed, the only thing left to believe in kicked off at three.', author: 'Marcus Bell', read: '18 min', hue: 36 },
  { kicker: 'BEYOND', headline: 'What Happens to a Prodigy at Thirty-Four', sub: 'He was the future once. Nobody warns you how long the future lasts.', author: 'Lena Cardoso', read: '12 min', hue: 268 },
  { kicker: 'BEYOND', headline: 'The Scout Who Found Greatness in a Parking Lot', sub: 'Forty years, a thermos, and an eye nobody could teach.', author: 'Dani Okafor', read: '16 min', hue: 96 },
].map(makeStory)

// ─── Section registry (design `openCategory` targets) ─────────────────────────

export type SectionKey =
  | 'news' | 'transfers' | 'tactics' | 'worldcup' | 'premier' | 'champions'
  | 'laliga' | 'tv' | 'beyond' | 'motherland'

export const SECTIONS: Record<SectionKey, { title: string; label: string; items: Story[] }> = {
  news:       { title: 'News',                label: 'News',           items: [FEATURED_STORY, ...SECONDARY_STORIES, ...TRENDING_STORIES] },
  transfers:  { title: 'Transfers',           label: 'Transfers',      items: TRANSFER_STORIES },
  tactics:    { title: 'Tactical Breakdowns', label: 'Tactics',        items: TACTICS_STORIES },
  worldcup:   { title: 'World Cup 2026',      label: 'World Cup',      items: WORLDCUP_STORIES },
  premier:    { title: 'Premier League',      label: 'Premier League', items: PREMIER_STORIES },
  champions:  { title: 'Champions League',    label: 'Champions',      items: CHAMPIONS_STORIES },
  laliga:     { title: 'La Liga',             label: 'La Liga',        items: LALIGA_STORIES },
  tv:         { title: 'Fulltiime TV',        label: 'Fulltiime TV',   items: [VIDEO_FEATURED, ...VIDEO_STORIES] },
  beyond:     { title: 'Beyond the Whistle',  label: 'Beyond',         items: LONGFORM_STORIES },
  motherland: { title: 'The Motherland',      label: 'The Motherland', items: AFRICA_STORIES },
}

export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[]

export function getSection(key: string | null | undefined) {
  if (key && key in SECTIONS) return SECTIONS[key as SectionKey]
  return null
}

const ALL_STORIES = new Map<string, Story>()
for (const key of SECTION_KEYS) {
  for (const story of SECTIONS[key].items) ALL_STORIES.set(story.slug, story)
}

export function getStory(slug: string): Story | null {
  return ALL_STORIES.get(slug) ?? null
}
