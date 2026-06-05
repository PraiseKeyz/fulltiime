// ─── Dummy news data ──────────────────────────────────────────────────────────
// Temporary editorial content until a real news/CMS source is wired up.
// Single source of truth — consumed by the homepage, /news list and /news/[slug].

export interface NewsArticle {
  id:           string
  slug:         string
  title:        string
  excerpt:      string
  content:      string   // paragraphs separated by blank lines
  category:     string   // primary tag, e.g. 'WORLD CUP'
  categories:   string[] // for filtering
  author:       string
  publishedAt:  string   // ISO date
  readTime:     string
  cover:        string
  tags:         string[]
  featured?:    boolean
}

export const TAG_COLORS: Record<string, string> = {
  'WORLD CUP':         '#3b82f6',
  'CHAMPIONS LEAGUE':  '#4da6ff',
  'PREMIER LEAGUE':    '#8b5cf6',
  'LA LIGA':           '#f97316',
  'SERIE A':           '#10b981',
  'BUNDESLIGA':        '#ef4444',
  'TRANSFERS':         '#f59e0b',
  'ANALYSIS':          '#22c55e',
  'BREAKING':          '#ef4444',
}

export const NEWS: NewsArticle[] = [
  {
    id:    '1',
    slug:  'world-cup-2026-everything-you-need-to-know',
    title: 'World Cup 2026: Everything You Need To Know Before Kick-Off',
    excerpt:
      'The first 48-team World Cup kicks off across the USA, Canada and Mexico on June 11. Here is your complete guide to the tournament.',
    content: `For the first time in history, the FIFA World Cup will feature 48 teams, spread across three host nations and 16 cities. It is the largest football tournament ever staged, and anticipation has reached fever pitch as the opening fixtures approach.

The expanded format means 104 matches over 39 days — a significant jump from the 64 played in previous editions. Group stages will see 12 groups of four, with the top two from each group, plus the eight best third-placed sides, advancing to a new round of 32.

Defending champions Argentina arrive as favourites alongside perennial contenders France, Brazil and England. But the expanded field opens the door for emerging nations to make a deeper run than ever before.

With matches spread from Vancouver to Mexico City, travel and climate will play an unprecedented role. Teams based in the northern cities will enjoy cooler conditions, while those in the south must contend with summer heat and altitude.`,
    category:    'WORLD CUP',
    categories:  ['WORLD CUP', 'BREAKING'],
    author:      'James Morrison',
    publishedAt: '2026-06-04T09:00:00Z',
    readTime:    '6 min',
    cover:       '',
    tags:        ['World Cup', 'FIFA', 'Tournament'],
    featured:    true,
  },
  {
    id:    '2',
    slug:  'mbappe-france-world-cup-captaincy',
    title: 'Mbappé To Lead France As Captain In World Cup Title Defence Bid',
    excerpt:
      'Didier Deschamps confirms Kylian Mbappé will wear the armband as France chase a third World Cup crown.',
    content: `France manager Didier Deschamps has confirmed that Kylian Mbappé will captain Les Bleus at the 2026 World Cup, cementing the forward's status as the leader of a new generation.

Mbappé, already a World Cup winner from 2018 and the tournament's top scorer in 2022, takes on the role following the international retirements of several senior figures.

"Kylian has grown enormously, not just as a player but as a person and a leader," Deschamps said at the squad announcement. "He carries this team's ambitions, and he is ready for the responsibility."

France have been drawn in a manageable group but face a potential blockbuster knockout path. Mbappé's form will be decisive if they are to become the first nation to retain the trophy since Brazil in 1962.`,
    category:    'WORLD CUP',
    categories:  ['WORLD CUP', 'BREAKING'],
    author:      'Elena Torres',
    publishedAt: '2026-06-03T14:30:00Z',
    readTime:    '3 min',
    cover:       '',
    tags:        ['France', 'Mbappé', 'World Cup'],
  },
  {
    id:    '3',
    slug:  'premier-league-title-race-review',
    title: 'Premier League 2025/26 In Review: The Season That Had Everything',
    excerpt:
      'From a dramatic title finish to relegation heartbreak, we look back at a Premier League campaign for the ages.',
    content: `The 2025/26 Premier League season delivered drama until the very last kick. A title race that went down to the final day, a record-breaking goalscoring campaign, and a relegation battle that defied all predictions.

At the top, the champions secured the trophy with a tally that would have won most previous seasons by a distance, yet the margin at the summit was a single point — a testament to the relentless quality across the chasing pack.

Individually, the Golden Boot race produced one of the highest tallies in Premier League history, with three players surpassing the 25-goal mark.

As attention turns to the World Cup and then a new campaign, clubs are already reshaping their squads. The summer window promises to be one of the most active in years.`,
    category:    'PREMIER LEAGUE',
    categories:  ['PREMIER LEAGUE', 'ANALYSIS'],
    author:      'Tom Clarke',
    publishedAt: '2026-05-25T18:00:00Z',
    readTime:    '7 min',
    cover:       '',
    tags:        ['Premier League', 'Season Review'],
  },
  {
    id:    '4',
    slug:  'summer-transfer-window-biggest-deals',
    title: 'Summer Transfer Window: The Deals That Could Define Next Season',
    excerpt:
      'With the World Cup acting as a global shop window, Europe\'s biggest clubs are preparing record-breaking moves.',
    content: `The summer transfer window is shaping up to be one of the most explosive in recent memory, with the World Cup providing the perfect stage for players to boost their value.

Several marquee names are expected to move, with release clauses activated and long-pursued targets finally within reach for the continent's superpowers.

Sporting directors across Europe have spent months laying the groundwork, and the tournament's standout performers could see their price tags soar overnight.

History shows that a strong World Cup can transform a career — and a club's summer business. Expect the headline deals to land in the weeks immediately following the final.`,
    category:    'TRANSFERS',
    categories:  ['TRANSFERS'],
    author:      'Carlos Medina',
    publishedAt: '2026-06-02T11:15:00Z',
    readTime:    '4 min',
    cover:       '',
    tags:        ['Transfers', 'Summer Window'],
  },
  {
    id:    '5',
    slug:  'caf-champions-league-final-preview',
    title: 'CAF Champions League Final: A Continental Showpiece Awaits',
    excerpt:
      'Africa\'s premier club competition reaches its climax with two giants set to battle for continental glory.',
    content: `The CAF Champions League final is upon us, and African football's biggest club prize will be decided in a clash that pits two of the continent's most storied institutions against each other.

Both finalists have navigated a gruelling campaign, surviving fierce group stages and tense knockout ties to reach this stage. The quality on display has underlined the growing strength of the African club game.

For the players, this is more than a trophy — it is a platform. Strong performances here have historically opened doors to moves across Europe and the Middle East.

A continental title also brings qualification to the expanded Club World Cup, raising the stakes even higher for two squads chasing footballing immortality.`,
    category:    'BREAKING',
    categories:  ['BREAKING'],
    author:      'Sarah Williams',
    publishedAt: '2026-05-24T20:00:00Z',
    readTime:    '5 min',
    cover:       '',
    tags:        ['CAF', 'Champions League', 'Africa'],
  },
  {
    id:    '6',
    slug:  'tactical-trends-shaping-modern-football',
    title: 'The Tactical Trends Shaping Modern Football In 2026',
    excerpt:
      'Inverted full-backs, possession-based pressing and positional fluidity — the ideas redefining how the game is played.',
    content: `Football's tactical evolution shows no sign of slowing. The 2025/26 season saw several ideas move from the fringes into the mainstream, reshaping how elite teams approach both possession and pressing.

The inverted full-back, once a novelty, is now a staple at the highest level. By stepping into midfield, these players give their teams numerical superiority in central areas and unlock new build-up patterns.

Equally significant is the rise of positional fluidity — systems where players rotate freely, blurring traditional roles and overwhelming rigid defensive structures.

As the World Cup approaches, national-team coaches will look to adapt these club innovations to the unique demands of tournament football, where preparation time is short and margins are razor-thin.`,
    category:    'ANALYSIS',
    categories:  ['ANALYSIS'],
    author:      'David Mitchell',
    publishedAt: '2026-05-30T10:00:00Z',
    readTime:    '9 min',
    cover:       '',
    tags:        ['Tactics', 'Analysis'],
  },
  {
    id:    '7',
    slug:  'la-liga-galacticos-new-era',
    title: 'La Liga\'s New Galácticos: A New Era Dawns In Spain',
    excerpt:
      'Spanish football is entering a fresh cycle of superstar talent as a new generation takes centre stage.',
    content: `La Liga has long been a stage for footballing royalty, and a new wave of galácticos is emerging to carry the torch into the next decade.

The league's biggest clubs have pivoted towards younger, dynamic profiles — blending homegrown academy products with carefully chosen international signings.

This shift reflects a broader strategy: building sustainable, exciting teams capable of competing on multiple fronts without the financial excesses of the past.

For neutrals, the result is a more open, unpredictable league — and a Clásico rivalry that feels reinvigorated heading into the new campaign.`,
    category:    'LA LIGA',
    categories:  ['LA LIGA', 'ANALYSIS'],
    author:      'Rafael Costa',
    publishedAt: '2026-05-28T16:45:00Z',
    readTime:    '6 min',
    cover:       '',
    tags:        ['La Liga', 'Spain'],
  },
  {
    id:    '8',
    slug:  'goalkeeping-revolution-sweeper-keepers',
    title: 'The Goalkeeping Revolution: How Sweeper-Keepers Took Over',
    excerpt:
      'The modern goalkeeper is as comfortable on the ball as any outfield player. We examine the position\'s transformation.',
    content: `The goalkeeper's role has undergone a quiet revolution. No longer confined to the six-yard box, the modern keeper is a central figure in his team's build-up play.

The "sweeper-keeper" — comfortable rushing off the line, playing out from the back and even initiating attacks — has become essential to the possession-heavy systems favoured at the top level.

This evolution has changed how clubs scout and develop the position. Distribution, composure under pressure and decision-making now rank alongside traditional shot-stopping in a keeper's profile.

At the World Cup, where a single moment can decide a knockout tie, the balance between footballing ability and reliability in goal will be fascinating to watch.`,
    category:    'ANALYSIS',
    categories:  ['ANALYSIS'],
    author:      'Priya Sharma',
    publishedAt: '2026-05-22T08:30:00Z',
    readTime:    '7 min',
    cover:       '',
    tags:        ['Goalkeeping', 'Analysis'],
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getLatestNews(count?: number): NewsArticle[] {
  const sorted = [...NEWS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
  return count ? sorted.slice(0, count) : sorted
}

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS.find(a => a.slug === slug)
}

export function getRelatedNews(slug: string, count = 3): NewsArticle[] {
  const current = getArticleBySlug(slug)
  if (!current) return getLatestNews(count)
  return NEWS
    .filter(a => a.slug !== slug && a.categories.some(c => current.categories.includes(c)))
    .slice(0, count)
}

// Relative "x ago" formatting for display
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60)  return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7)   return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
