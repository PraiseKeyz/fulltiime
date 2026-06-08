import type { Metadata } from 'next'
import { buildMetadata, SITE_NAME } from '@/lib/seo'
import { getArticleBySlug } from '@/data/news'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return buildMetadata({
      title: 'Article not found',
      description: 'The article you’re looking for could not be found.',
      path: `/news/${slug}`,
    })
  }

  const meta = buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    image: article.cover || undefined,
    type: 'article',
  })

  // Enrich the OpenGraph object with article-specific fields.
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      section: article.category,
    },
    authors: [{ name: article.author }],
    creator: article.author,
    publisher: SITE_NAME,
  }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children
}
