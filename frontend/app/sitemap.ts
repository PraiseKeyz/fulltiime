import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { api } from '@/lib/api/instance'
import type { PaginatedArticles } from '@/lib/api/domain'

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
  { path: '/teams',     changeFrequency: 'weekly', priority: 0.7 },
  { path: '/news',      changeFrequency: 'daily',  priority: 0.8 },
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

  return [...staticEntries, ...newsEntries]
}
