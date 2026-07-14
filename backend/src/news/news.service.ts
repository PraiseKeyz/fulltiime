import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { ArticleStatus, Section } from '../../generated/prisma/index.js';

const AUTHOR_SELECT = {
  author: { select: { id: true, username: true, full_name: true, avatar_url: true } },
} as const;

/** Sections that get a rail on the homepage, in display order. */
const HOME_RAILS: Section[] = [
  Section.MOTHERLAND,
  Section.WORLDCUP,
  Section.PREMIER,
  Section.CHAMPIONS,
  Section.TV,
  Section.TRANSFERS,
  Section.BEYOND,
];

/**
 * Public reads only — all authoring and workflow live in the studio module.
 */
@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { section?: Section; limit?: number; page?: number }) {
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;

    const where = {
      status: ArticleStatus.PUBLISHED,
      ...(query.section && { section: query.section }),
    };

    const [articles, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        include: AUTHOR_SELECT,
        orderBy: [{ pin_order: { sort: 'asc', nulls: 'last' } }, { published_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data: { articles, total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: AUTHOR_SELECT,
    });
    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException('Article not found');
    }
    return { data: article };
  }


  async related(slug: string, limit = 3) {
    const source = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true, section: true, tags: true, status: true },
    });
    if (!source || source.status !== ArticleStatus.PUBLISHED) {
      return { data: [] };
    }

    let byTags: Awaited<ReturnType<typeof this.prisma.article.findMany>> = [];
    if (source.tags.length) {
      const candidates = await this.prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          id: { not: source.id },
          tags: { hasSome: source.tags },
        },
        include: AUTHOR_SELECT,
        orderBy: { published_at: 'desc' },
        take: Math.max(limit * 4, 12),
      });
      const sourceTags = new Set(source.tags);
      byTags = candidates
        .map((a) => ({ a, shared: a.tags.filter((t) => sourceTags.has(t)).length }))
        .sort((x, y) => y.shared - x.shared)
        .slice(0, limit)
        .map(({ a }) => a);
    }

    const picked = [...byTags];
    if (picked.length < limit) {
      const bySection = await this.prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          section: source.section,
          id: { notIn: [source.id, ...picked.map((a) => a.id)] },
        },
        include: AUTHOR_SELECT,
        orderBy: { published_at: 'desc' },
        take: limit - picked.length,
      });
      picked.push(...bySection);
    }

    return { data: picked.slice(0, limit) };
  }

  async home() {
    const published = { status: ArticleStatus.PUBLISHED };

    const [featured, recent, ...rails] = await Promise.all([
      this.prisma.article.findFirst({
        where: { ...published, is_featured: true },
        include: AUTHOR_SELECT,
        orderBy: { published_at: 'desc' },
      }),
      this.prisma.article.findMany({
        where: published,
        include: AUTHOR_SELECT,
        orderBy: { published_at: 'desc' },
        take: 9,
      }),
      ...HOME_RAILS.map((section) =>
        this.prisma.article.findMany({
          where: { ...published, section },
          include: AUTHOR_SELECT,
          orderBy: [{ pin_order: { sort: 'asc', nulls: 'last' } }, { published_at: 'desc' }],
          take: 4,
        }),
      ),
    ]);

    // Hero falls back to the newest story when nothing is explicitly featured.
    const hero = featured ?? recent[0] ?? null;
    const rest = recent.filter((a) => a.id !== hero?.id);

    return {
      data: {
        featured: hero,
        latest: rest.slice(0, 3),
        trending: rest.slice(3, 8),
        sections: Object.fromEntries(HOME_RAILS.map((s, i) => [s, rails[i]])),
      },
    };
  }
}
