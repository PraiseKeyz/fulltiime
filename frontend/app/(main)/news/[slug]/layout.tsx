import type { Metadata } from 'next'
import { buildMetadata, SITE_NAME } from '@/lib/seo'
import { api } from '@/lib/api/instance'
import type { Article } from '@/lib/api/domain'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  let article: Article | null = null
  try {
    article = await api.get<Article>(`/news/${slug}`, { silent: true })
  } catch {
    article = null
  }

  if (!article) {
    return buildMetadata({
      title: 'Article not found',
      description: 'The article you’re looking for could not be found.',
      path: `/news/${slug}`,
    })
  }

  const meta = buildMetadata({
    title: article.title,
    description: article.excerpt ?? undefined,
    path: `/news/${article.slug}`,
    image: article.cover_url || undefined,
    type: 'article',
  })

  const authorName = article.author.full_name ?? article.author.username

  // Enrich the OpenGraph object with article-specific fields.
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      authors: [authorName],
      tags: article.tags,
      section: article.category,
    },
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: SITE_NAME,
  }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children
}
