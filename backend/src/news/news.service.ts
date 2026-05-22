import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { ArticleCategory } from '../../generated/prisma/index.js';
import { CreateArticleDto } from './dto/create-article.dto.js';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { category?: ArticleCategory; limit?: number; page?: number }) {
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    const [articles, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: { is_published: true, ...(query.category && { category: query.category }) },
        include: { author: { select: { id: true, username: true, full_name: true, avatar_url: true } } },
        orderBy: { published_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.article.count({
        where: { is_published: true, ...(query.category && { category: query.category }) },
      }),
    ]);

    return { data: { articles, total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug, is_published: true },
      include: { author: { select: { id: true, username: true, full_name: true, avatar_url: true } } },
    });
    if (!article) throw new NotFoundException('Article not found');
    return { data: article };
  }

  async create(authorId: string, dto: CreateArticleDto) {
    const slug = this.generateSlug(dto.title);

    const article = await this.prisma.article.create({
      data: {
        ...dto,
        slug,
        author_id: authorId,
        published_at: dto.is_published ? new Date() : null,
      },
      include: { author: { select: { id: true, username: true, full_name: true, avatar_url: true } } },
    });

    return { data: article, message: 'Article created' };
  }

  async update(id: string, authorId: string, dto: Partial<CreateArticleDto>) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    if (article.author_id !== authorId) throw new ForbiddenException('Not your article');

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.is_published && !article.is_published ? { published_at: new Date() } : {}),
      },
      include: { author: { select: { id: true, username: true, full_name: true, avatar_url: true } } },
    });

    return { data: updated, message: 'Article updated' };
  }

  async remove(id: string, authorId: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    if (article.author_id !== authorId) throw new ForbiddenException('Not your article');

    await this.prisma.article.delete({ where: { id } });
    return { message: 'Article deleted' };
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) +
      '-' +
      Date.now()
    );
  }
}
