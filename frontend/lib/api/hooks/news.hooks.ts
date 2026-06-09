import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../instance'
import type { Article, ArticleCategory, PaginatedArticles } from '../domain'

export const newsKeys = {
  all: ['news'] as const,
  list: (filters: object) => ['news', 'list', filters] as const,
  detail: (slug: string) => ['news', 'detail', slug] as const,
}

export function useArticles(filters: { category?: ArticleCategory; page?: number; limit?: number } = {}) {
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

export function useCreateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      title: string
      content: string
      category: ArticleCategory
      is_published: boolean
      excerpt?: string
      cover_url?: string
      tags?: string[]
    }) => api.post<Article>('/news', body, { successMessage: 'Article published!' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.all })
    },
  })
}
