import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '@/prisma/prisma.service.js';
import { ArticleStatus, Prisma, Role } from '../../generated/prisma/index.js';
import { roleAtLeast } from '@/auth/guards/roles.guard.js';
import { CloudinaryService } from '@/cloudinary/cloudinary.service.js';
import { EmailService } from '@/email/email.service.js';
import { ConfigService } from '@nestjs/config';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { CreateStaffDto, ListArticlesQuery } from './dto/studio.dto.js';

type Actor = { id: string; role: Role };

const AUTHOR_SELECT = {
  author: { select: { id: true, username: true, full_name: true, avatar_url: true } },
} as const;

@Injectable()
export class StudioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  // ── Article list & detail ──────────────────────────────────────────────────

  async listArticles(actor: Actor, q: ListArticlesQuery) {
    const limit = q.limit ?? 20;
    const page = q.page ?? 1;

    const where: Prisma.ArticleWhereInput = {
      // Writers only ever see their own work in the studio.
      ...(roleAtLeast(actor.role, Role.EDITOR)
        ? q.author_id
          ? { author_id: q.author_id }
          : {}
        : { author_id: actor.id }),
      ...(q.status && { status: q.status }),
      ...(q.section && { section: q.section }),
      ...(q.search && { title: { contains: q.search, mode: 'insensitive' as const } }),
    };

    const [articles, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        include: AUTHOR_SELECT,
        orderBy: { updated_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data: { articles, total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getArticle(id: string, actor: Actor) {
    const article = await this.findOwned(id, actor)
    return { data: article };
  }

  // ── Authoring ──────────────────────────────────────────────────────────────

  async create(actor: Actor, dto: CreateArticleDto) {
    const article = await this.prisma.article.create({
      data: {
        ...dto,
        slug: this.generateSlug(dto.title),
        author_id: actor.id,
        status: ArticleStatus.DRAFT,
      },
      include: AUTHOR_SELECT,
    });
    return { data: article, message: 'Draft created' };
  }

  async update(id: string, actor: Actor, dto: Partial<CreateArticleDto>) {
    const article = await this.findOwned(id, actor);

    if (!roleAtLeast(actor.role, Role.EDITOR) && article.status !== ArticleStatus.DRAFT) {
      throw new ForbiddenException('Only drafts can be edited — ask an editor for changes');
    }

    const updated = await this.prisma.article.update({
      where: { id: article.id },
      data: dto,
      include: AUTHOR_SELECT,
    });
    return { data: updated, message: 'Article updated' };
  }

  async remove(id: string, actor: Actor) {
    const article = await this.findOwned(id, actor);
    if (!roleAtLeast(actor.role, Role.EDITOR) && article.status !== ArticleStatus.DRAFT) {
      throw new ForbiddenException('Only drafts can be deleted');
    }
    await this.prisma.article.delete({ where: { id: article.id } });
    return { message: 'Article deleted' };
  }

  // ── Workflow transitions ───────────────────────────────────────────────────

  async submit(id: string, actor: Actor) {
    const article = await this.findOwned(id, actor);
    this.assertStatus(article.status, [ArticleStatus.DRAFT]);

    const updated = await this.prisma.article.update({
      where: { id: article.id },
      data: { status: ArticleStatus.IN_REVIEW, submitted_at: new Date(), review_note: null },
      include: AUTHOR_SELECT,
    });
    return { data: updated, message: 'Submitted for review' };
  }

  /** Editor publishes — from review, straight from a draft, or re-publishing an archive. */
  async publish(id: string) {
    const article = await this.findOrThrow(id);
    this.assertStatus(article.status, [
      ArticleStatus.DRAFT,
      ArticleStatus.IN_REVIEW,
      ArticleStatus.ARCHIVED,
    ]);

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.PUBLISHED,
        published_at: article.published_at ?? new Date(),
        review_note: null,
      },
      include: AUTHOR_SELECT,
    });
    return { data: updated, message: 'Published' };
  }

  /** Editor sends a submission back to the writer with a note. */
  async reject(id: string, note: string) {
    const article = await this.findOrThrow(id);
    this.assertStatus(article.status, [ArticleStatus.IN_REVIEW]);

    const updated = await this.prisma.article.update({
      where: { id },
      data: { status: ArticleStatus.DRAFT, review_note: note },
      include: AUTHOR_SELECT,
    });
    return { data: updated, message: 'Sent back to writer' };
  }

  /** Editor takes a live article down. */
  async unpublish(id: string) {
    const article = await this.findOrThrow(id);
    this.assertStatus(article.status, [ArticleStatus.PUBLISHED]);

    const updated = await this.prisma.article.update({
      where: { id },
      data: { status: ArticleStatus.ARCHIVED, is_featured: false, pin_order: null },
      include: AUTHOR_SELECT,
    });
    return { data: updated, message: 'Unpublished' };
  }

  // ── Homepage curation ──────────────────────────────────────────────────────

  /** Make this article the homepage hero (exactly one at a time). */
  async feature(id: string) {
    const article = await this.findOrThrow(id);
    this.assertStatus(article.status, [ArticleStatus.PUBLISHED]);

    const [, updated] = await this.prisma.$transaction([
      this.prisma.article.updateMany({
        where: { is_featured: true },
        data: { is_featured: false },
      }),
      this.prisma.article.update({
        where: { id },
        data: { is_featured: true },
        include: AUTHOR_SELECT,
      }),
    ]);
    return { data: updated, message: 'Featured on the homepage' };
  }

  async pin(id: string, pinOrder: number | null | undefined) {
    await this.findOrThrow(id);
    const updated = await this.prisma.article.update({
      where: { id },
      data: { pin_order: pinOrder ?? null },
      include: AUTHOR_SELECT,
    });
    return { data: updated, message: pinOrder == null ? 'Pin cleared' : 'Pinned' };
  }

  // ── Media ──────────────────────────────────────────────────────────────────

  async uploadMedia(actor: Actor, file: Express.Multer.File) {
    const result = await this.cloudinary.upload(file);
    try {
      const media = await this.prisma.media.create({
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          uploader_id: actor.id,
        },
      });
      return { data: media, message: 'Uploaded' };
    } catch (error) {
      // Compensate: the DB row failed, so don't leave an orphaned asset in
      // Cloudinary. Best-effort — surfacing the original error matters more.
      await this.cloudinary.destroy(result.public_id).catch(() => {});
      throw error;
    }
  }

  async listMedia(actor: Actor, page = 1, limit = 40) {
    const where = roleAtLeast(actor.role, Role.EDITOR) ? {} : { uploader_id: actor.id };
    const [media, total] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);
    return { data: { media, total, page, limit, pages: Math.ceil(total / limit) } };
  }

  /** Permanently deletes the asset from Cloudinary and the media record. */
  async deleteMedia(actor: Actor, id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    if (media.uploader_id !== actor.id && !roleAtLeast(actor.role, Role.EDITOR)) {
      throw new ForbiddenException('Not your upload');
    }

    await this.cloudinary.destroy(media.public_id);
    await this.prisma.media.delete({ where: { id } });
    return { message: 'Image deleted' };
  }

  // ── User administration (admin only — enforced at the controller) ──────────

  async listUsers(page = 1, limit = 30, search?: string) {
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { full_name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          full_name: true,
          avatar_url: true,
          role: true,
          is_verified: true,
          created_at: true,
          _count: { select: { articles: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data: { users, total, page, limit, pages: Math.ceil(total / limit) } };
  }

  /**
   * Admin creates a writer/editor account. A one-time password is generated
   * (or taken from the dto), emailed to the new staff member, and they are
   * forced to choose their own password on first login.
   */
  async createStaff(dto: CreateStaffDto) {
    const clash = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
      select: { email: true },
    });
    if (clash) {
      throw new ConflictException(
        clash.email === dto.email ? 'Email already in use' : 'Username already taken',
      );
    }

    const tempPassword = dto.password ?? randomBytes(9).toString('base64url');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        full_name: dto.full_name,
        role: dto.role,
        password_hash: await argon2.hash(tempPassword),
        is_verified: true,
        must_change_password: true,
      },
      select: { id: true, email: true, username: true, full_name: true, role: true },
    });

    // Email the one-time password. If the send fails the account still exists,
    // so surface the temp password to the admin as a fallback hand-off.
    let emailed = true;
    try {
      await this.email.sendStaffInviteEmail(
        user.email,
        user.full_name ?? user.username,
        user.role,
        tempPassword,
        `${this.frontendUrl}/login`,
      );
    } catch {
      emailed = false; // already logged in detail by EmailService
    }

    return {
      data: {
        user,
        emailed,
        temp_password: emailed ? undefined : tempPassword,
      },
      message: emailed
        ? `Invite sent to ${user.email}`
        : 'Account created, but the invite email failed — share the one-time password manually',
    };
  }

  async updateRole(actorId: string, userId: string, role: Role) {
    if (actorId === userId) {
      throw new BadRequestException('You cannot change your own role');
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, role: true },
    });
    return { data: user, message: `Role set to ${role}` };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private get frontendUrl(): string {
    const raw = this.config.get<string>('FRONTEND_URL') ?? '';
    const first = raw.split(',').map((s) => s.trim()).find(Boolean);
    return (first ?? 'https://fulltiime.com').replace(/\/$/, '');
  }

  private async findOrThrow(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: AUTHOR_SELECT,
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  /** Writers may only touch their own articles; editors and admins any. */
  private async findOwned(id: string, actor: Actor) {
    const article = await this.findOrThrow(id);
    if (article.author_id !== actor.id && !roleAtLeast(actor.role, Role.EDITOR)) {
      throw new ForbiddenException('Not your article');
    }
    return article;
  }

  private assertStatus(current: ArticleStatus, allowed: ArticleStatus[]) {
    if (!allowed.includes(current)) {
      throw new BadRequestException(
        `Not allowed while article is ${current} (requires ${allowed.join(' or ')})`,
      );
    }
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
      Date.now().toString(36)
    );
  }
}
