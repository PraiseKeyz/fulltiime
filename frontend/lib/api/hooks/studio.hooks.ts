import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../instance'
import type {
  Article,
  ArticleStatus,
  Media,
  PaginatedArticles,
  PaginatedMedia,
  PaginatedUsers,
  Role,
  Section,
  StudioUser,
} from '../domain'

export const studioKeys = {
  all: ['studio'] as const,
  articles: (filters: object) => ['studio', 'articles', filters] as const,
  article: (id: string) => ['studio', 'article', id] as const,
  media: (page: number) => ['studio', 'media', page] as const,
  users: (page: number, search: string) => ['studio', 'users', page, search] as const,
}

// ─── Article payloads ─────────────────────────────────────────────────────────

export interface ArticleInput {
  title: string
  content: string
  section: Section
  excerpt?: string
  cover_url?: string
  kicker?: string
  hue?: number
  move?: string
  crest?: string
  formation?: string
  video_url?: string
  duration?: string
  tags?: string[]
}

export interface StudioArticleFilters {
  status?: ArticleStatus
  section?: Section
  author_id?: string
  search?: string
  page?: number
  limit?: number
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export function useStudioArticles(filters: StudioArticleFilters = {}) {
  return useQuery({
    queryKey: studioKeys.articles(filters),
    queryFn: () =>
      api.get<PaginatedArticles>('/studio/articles', {
        params: Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
        ) as Record<string, string | number>,
      }),
  })
}

export function useStudioArticle(id: string) {
  return useQuery({
    queryKey: studioKeys.article(id),
    queryFn: () => api.get<Article>(`/studio/articles/${id}`),
    enabled: !!id,
  })
}

function useArticleMutation<TVars>(
  fn: (vars: TVars) => Promise<unknown>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studioKeys.all })
      qc.invalidateQueries({ queryKey: ['news'] })
    },
  })
}

export function useCreateArticle() {
  return useArticleMutation((body: ArticleInput) =>
    api.post<Article>('/studio/articles', body, { successMessage: 'Draft created' }),
  )
}

export function useUpdateArticle() {
  return useArticleMutation(({ id, ...body }: Partial<ArticleInput> & { id: string }) =>
    api.patch<Article>(`/studio/articles/${id}`, body, { successMessage: 'Saved' }),
  )
}

export function useDeleteArticle() {
  return useArticleMutation((id: string) =>
    api.delete(`/studio/articles/${id}`, { successMessage: 'Article deleted' }),
  )
}

// ─── Workflow ─────────────────────────────────────────────────────────────────

export function useSubmitArticle() {
  return useArticleMutation((id: string) =>
    api.post<Article>(`/studio/articles/${id}/submit`, undefined, {
      successMessage: 'Submitted for review',
    }),
  )
}

export function usePublishArticle() {
  return useArticleMutation((id: string) =>
    api.post<Article>(`/studio/articles/${id}/publish`, undefined, {
      successMessage: 'Published',
    }),
  )
}

export function useRejectArticle() {
  return useArticleMutation(({ id, note }: { id: string; note: string }) =>
    api.post<Article>(`/studio/articles/${id}/reject`, { note }, {
      successMessage: 'Sent back to writer',
    }),
  )
}

export function useUnpublishArticle() {
  return useArticleMutation((id: string) =>
    api.post<Article>(`/studio/articles/${id}/unpublish`, undefined, {
      successMessage: 'Unpublished',
    }),
  )
}

// ─── Curation ─────────────────────────────────────────────────────────────────

export function useFeatureArticle() {
  return useArticleMutation((id: string) =>
    api.post<Article>(`/studio/articles/${id}/feature`, undefined, {
      successMessage: 'Featured on the homepage',
    }),
  )
}

export function usePinArticle() {
  return useArticleMutation(({ id, pin_order }: { id: string; pin_order: number | null }) =>
    api.post<Article>(`/studio/articles/${id}/pin`, { pin_order }),
  )
}

// ─── Media ────────────────────────────────────────────────────────────────────

export function useMediaList(page = 1) {
  return useQuery({
    queryKey: studioKeys.media(page),
    queryFn: () =>
      api.get<PaginatedMedia>('/studio/media', { params: { page } }),
  })
}

export function useUploadMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api.post<Media>('/studio/media', form, {
        successMessage: 'Uploaded',
        timeout: 60_000,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studio', 'media'] }),
  })
}

// ─── Users (admin) ────────────────────────────────────────────────────────────

export function useStudioUsers(page = 1, search = '') {
  return useQuery({
    queryKey: studioKeys.users(page, search),
    queryFn: () =>
      api.get<PaginatedUsers>('/studio/users', {
        params: search ? { page, search } : { page },
      }),
    placeholderData: (prev) => prev,
  })
}

export interface CreateStaffInput {
  email: string
  username: string
  full_name?: string
  role: 'WRITER' | 'EDITOR'
  password?: string
}

export interface CreateStaffResult {
  user: Pick<StudioUser, 'id' | 'email' | 'username' | 'full_name' | 'role'>
  /** Whether the invite email (with the one-time password) was delivered. */
  emailed: boolean
  /** Fallback when the email failed — shown once so the admin can share it. */
  temp_password?: string
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateStaffInput) =>
      api.post<CreateStaffResult>('/studio/users', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studio', 'users'] }),
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api.patch<StudioUser>(`/studio/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studio', 'users'] }),
  })
}
