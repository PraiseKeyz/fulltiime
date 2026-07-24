import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service.js';
import { EmailService } from '@/email/email.service.js';
import { getFrontendUrl } from '@/common/utils/frontend-url.util.js';
import { CampaignSenderService } from './campaign-sender.service.js';
import { CampaignStatus, SubscriberStatus, Prisma } from '../../generated/prisma/index.js';
import type { CreateCampaignDto, ListSubscribersQuery, UpdateCampaignDto } from './dto/newsletter-admin.dto.js';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    private readonly sender: CampaignSenderService,
  ) {}

  /** Single opt-in — subscribed the moment they submit, no confirm email. */
  async subscribe(email: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (existing?.status === SubscriberStatus.CONFIRMED) {
      return { message: "You're already subscribed — thanks for being here!" };
    }

    const data = {
      status: SubscriberStatus.CONFIRMED,
      confirmed_at: new Date(),
      unsubscribed_at: null,
    };

    if (existing) {
      await this.prisma.newsletterSubscriber.update({ where: { email }, data });
    } else {
      await this.prisma.newsletterSubscriber.create({ data: { email, ...data } });
    }

    return { message: "You're subscribed — welcome aboard!" };
  }

  async unsubscribe(token: string) {
    // Long-lived and unhashed by design — it has to keep working from every
    // campaign email ever sent, and the worst case of it leaking is someone
    // else unsubscribing that address, not an account compromise.
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { unsubscribe_token: token },
    });
    if (!subscriber) throw new NotFoundException('Subscriber not found.');

    if (subscriber.status !== SubscriberStatus.UNSUBSCRIBED) {
      await this.prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: { status: SubscriberStatus.UNSUBSCRIBED, unsubscribed_at: new Date() },
      });
    }

    return { message: "You've been unsubscribed. Sorry to see you go." };
  }

  // ── Admin: subscribers ────────────────────────────────────────────────────

  async listSubscribers(query: ListSubscribersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 30;
    const where: Prisma.NewsletterSubscriberWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.search && { email: { contains: query.search, mode: 'insensitive' } }),
    };

    const [subscribers, total] = await this.prisma.$transaction([
      this.prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribed_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);

    return { data: { subscribers, total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async deleteSubscriber(id: string) {
    await this.prisma.newsletterSubscriber.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Subscriber not found');
    });
    return { message: 'Subscriber removed' };
  }

  // ── Admin: campaigns ───────────────────────────────────────────────────────

  async listCampaigns() {
    const campaigns = await this.prisma.newsletterCampaign.findMany({
      orderBy: { created_at: 'desc' },
      include: { author: { select: { id: true, username: true, full_name: true } } },
    });
    return { data: campaigns };
  }

  async getCampaign(id: string) {
    const campaign = await this.findCampaignOrThrow(id);
    return { data: campaign };
  }

  async createCampaign(authorId: string, dto: CreateCampaignDto) {
    const campaign = await this.prisma.newsletterCampaign.create({
      data: { subject: dto.subject, content: dto.content, author_id: authorId },
    });
    return { data: campaign, message: 'Draft created' };
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.findCampaignOrThrow(id);
    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Only draft campaigns can be edited');
    }
    const updated = await this.prisma.newsletterCampaign.update({ where: { id }, data: dto });
    return { data: updated, message: 'Saved' };
  }

  async deleteCampaign(id: string) {
    const campaign = await this.findCampaignOrThrow(id);
    if (campaign.status === CampaignStatus.SENDING) {
      throw new BadRequestException('Cannot delete a campaign while it is sending');
    }
    await this.prisma.newsletterCampaign.delete({ where: { id } });
    return { message: 'Campaign deleted' };
  }

  async sendTest(id: string, toEmail: string) {
    const campaign = await this.findCampaignOrThrow(id);
    const unsubscribeUrl = `${getFrontendUrl(this.config)}/newsletter/unsubscribe?token=test`;
    await this.email.sendNewsletterCampaign(toEmail, `[TEST] ${campaign.subject}`, campaign.content, unsubscribeUrl);
    return { message: `Test email sent to ${toEmail}` };
  }

  async send(id: string) {
    const campaign = await this.findCampaignOrThrow(id);
    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Only draft campaigns can be sent');
    }

    // Fire-and-forget: the HTTP response returns immediately, the studio
    // polls the campaign row (status/sent_count) for progress.
    this.sender.run(id).catch((error: any) => {
      this.logger.error(`Campaign ${id} send loop crashed: ${error?.message ?? 'unknown'}`);
    });

    return { message: 'Sending started' };
  }

  private async findCampaignOrThrow(id: string) {
    const campaign = await this.prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }
}
