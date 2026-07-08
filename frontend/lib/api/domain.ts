// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: 'USER' | 'ADMIN'
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
}

// ─── News ─────────────────────────────────────────────────────────────────────

export type ArticleCategory =
  | 'NEWS'
  | 'ANALYSIS'
  | 'INTERVIEW'
  | 'TRANSFER'
  | 'MATCH_REPORT'

export interface ArticleAuthor {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_url: string | null
  category: ArticleCategory
  is_published: boolean
  published_at: string | null
  author: ArticleAuthor
  tags: string[]
  created_at: string
  updated_at: string
}

export interface PaginatedArticles {
  articles: Article[]
  total: number
  page: number
  limit: number
  pages: number
}
