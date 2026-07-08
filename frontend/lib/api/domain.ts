// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Hierarchical: USER < WRITER < EDITOR < ADMIN (see lib/roles.ts). */
export type Role = 'USER' | 'WRITER' | 'EDITOR' | 'ADMIN'

export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
}

// ─── News / Editorial ─────────────────────────────────────────────────────────

export type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'

export type Section =
  | 'NEWS'
  | 'TRANSFERS'
  | 'TACTICS'
  | 'WORLDCUP'
  | 'PREMIER'
  | 'CHAMPIONS'
  | 'LALIGA'
  | 'TV'
  | 'BEYOND'
  | 'MOTHERLAND'

export interface Insight {
  l: string
  t: string
}

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
  /** Standfirst — shown under the headline and on cards. */
  excerpt: string | null
  content: string
  cover_url: string | null
  section: Section
  kicker: string | null
  hue: number | null

  // Section-specific extras
  move: string | null
  crest: string | null
  formation: string | null
  video_url: string | null
  duration: string | null

  ai_insights: Insight[] | null

  // Workflow
  status: ArticleStatus
  submitted_at: string | null
  published_at: string | null
  scheduled_at: string | null
  review_note: string | null

  // Curation
  is_featured: boolean
  pin_order: number | null

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

export interface HomePayload {
  featured: Article | null
  latest: Article[]
  trending: Article[]
  sections: Record<Section, Article[]>
}

// ─── Studio ───────────────────────────────────────────────────────────────────

export interface Media {
  id: string
  public_id: string
  url: string
  width: number | null
  height: number | null
  format: string | null
  bytes: number | null
  uploader_id: string
  created_at: string
}

export interface PaginatedMedia {
  media: Media[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface StudioUser {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  is_verified: boolean
  created_at: string
  _count: { articles: number }
}

export interface PaginatedUsers {
  users: StudioUser[]
  total: number
  page: number
  limit: number
  pages: number
}
