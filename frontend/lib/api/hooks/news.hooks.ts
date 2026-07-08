import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'
import type { Article, HomePayload, PaginatedArticles, Section } from '../domain'

export const newsKeys = {
  all: ['news'] as const,
  home: ['news', 'home'] as const,
  list: (filters: object) => ['news', 'list', filters] as const,
  detail: (slug: string) => ['news', 'detail', slug] as const,
}

export function useHome() {
  return useQuery({
    queryKey: newsKeys.home,
    queryFn: () => api.get<HomePayload>('/news/home'),
    staleTime: 60_000,
  })
}

export function useArticles(filters: { section?: Section; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: newsKeys.list(filters),
    queryFn: () =>
      api.get<PaginatedArticles>('/news', {
        params: Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined),
        ) as Record<string, string | number>,
      }),
    staleTime: 60_000,  // treat fetched page as fresh for 1 min — no redundant refetches
    gcTime:    30_000,  // drop cached page from memory 30s after it's no longer viewed
  })
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: newsKeys.detail(slug),
    queryFn: () => api.get<Article>(`/news/${slug}`),
    enabled: !!slug,
  })
}
