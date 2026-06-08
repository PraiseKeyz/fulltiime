import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { NEWS } from '@/data/news'

const STATIC_ROUTES: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/',          changeFrequency: 'daily',  priority: 1.0 },
  { path: '/live',      changeFrequency: 'always', priority: 0.9 },
  { path: '/matches',   changeFrequency: 'daily',  priority: 0.9 },
  { path: '/fixtures',  changeFrequency: 'daily',  priority: 0.8 },
  { path: '/standings', changeFrequency: 'daily',  priority: 0.8 },
  { path: '/leagues',   changeFrequency: 'weekly', priority: 0.8 },
  { path: '/teams',     changeFrequency: 'weekly', priority: 0.7 },
  { path: '/news',      changeFrequency: 'daily',  priority: 0.8 },
  { path: '/transfers', changeFrequency: 'daily',  priority: 0.7 },
  { path: '/analytics', changeFrequency: 'weekly', priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const newsEntries: MetadataRoute.Sitemap = NEWS.map((article) => ({
    url: absoluteUrl(`/news/${article.slug}`),
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticEntries, ...newsEntries]
}
