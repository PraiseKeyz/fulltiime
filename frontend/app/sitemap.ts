import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { api } from '@/lib/api/instance'
import type { PaginatedArticles, League } from '@/lib/api/domain'

const STATIC_ROUTES: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/',          changeFrequency: 'daily',  priority: 1.0 },
  { path: '/matches',   changeFrequency: 'daily',  priority: 0.9 },
  { path: '/fixtures',  changeFrequency: 'daily',  priority: 0.8 },
  { path: '/standings', changeFrequency: 'daily',  priority: 0.8 },
  { path: '/leagues',   changeFrequency: 'weekly', priority: 0.8 },
  { path: '/news',      changeFrequency: 'daily',  priority: 0.8 },
  { path: '/transfers', changeFrequency: 'daily',  priority: 0.6 },
  { path: '/analytics', changeFrequency: 'daily',  priority: 0.6 },
  { path: '/about',     changeFrequency: 'monthly', priority: 0.4 },
  { path: '/terms',     changeFrequency: 'yearly',  priority: 0.2 },
  { path: '/privacy',   changeFrequency: 'yearly',  priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  let newsEntries: MetadataRoute.Sitemap = []
  try {
    const { articles } = await api.get<PaginatedArticles>('/news', { params: { limit: 200 }, silent: true })
    newsEntries = articles.map((article) => ({
      url: absoluteUrl(`/news/${article.slug}`),
      lastModified: article.published_at ? new Date(article.published_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch {
    // Backend unreachable at build time — sitemap still includes static routes
  }

  let leagueEntries: MetadataRoute.Sitemap = []
  try {
    const leagues = await api.get<League[]>('/leagues', { silent: true })
    leagueEntries = leagues.map((league) => ({
      url: absoluteUrl(`/leagues/${league.id}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch {
    // Backend unreachable at build time — sitemap still includes static routes
  }

  let matchEntries: MetadataRoute.Sitemap = []
  try {
    const matches = await api.get<{ id: string; updated_at: string }[]>('/fixtures/sitemap', { silent: true })
    matchEntries = matches.map((match) => ({
      url: absoluteUrl(`/matches/${match.id}`),
      lastModified: new Date(match.updated_at),
      changeFrequency: 'hourly',
      priority: 0.7,
    }))
  } catch {
    // Backend unreachable at build time — sitemap still includes static routes
  }

  return [...staticEntries, ...newsEntries, ...leagueEntries, ...matchEntries]
}
