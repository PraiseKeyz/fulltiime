import type { Article, HomePayload, PaginatedArticles, Section } from './domain'

// Server-side data access for public pages (RSC). Uses plain fetch with ISR
// so pages stay static-fast and refresh on a timer — no client waterfalls.
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

async function fetchApi<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate } })
    if (!res.ok) return null
    const json = (await res.json()) as { data: T }
    return json.data
  } catch {
    // API down (e.g. during builds) — pages render their fallback and ISR
    // picks the content up on the next revalidation.
    return null
  }
}

export const getHome = () => fetchApi<HomePayload>('/news/home')

export const getArticles = (section?: Section) =>
  fetchApi<PaginatedArticles>(`/news?limit=30${section ? `&section=${section}` : ''}`)

export const getArticleBySlug = (slug: string) =>
  fetchApi<Article>(`/news/${encodeURIComponent(slug)}`)

export const getRelatedArticles = async (slug: string, limit = 3) =>
  (await fetchApi<Article[]>(`/news/${encodeURIComponent(slug)}/related?limit=${limit}`)) ?? []
