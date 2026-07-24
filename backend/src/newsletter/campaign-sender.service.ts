import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service.js';
import { EmailService } from '@/email/email.service.js';
import { getFrontendUrl } from '@/common/utils/frontend-url.util.js';
import { CampaignStatus, SubscriberStatus } from '../../generated/prisma/index.js';

// Small concurrent batches with a pause between them — comfortably inside
// ZeptoMail's rate limits without needing a real job queue for a list this size.
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1_000;

/**
 * Runs a campaign send to completion in-process. Callers fire this without
 * awaiting it — the HTTP request that triggers a send returns immediately,
 * and the studio polls the campaign row for `sent_count` / `status` to show
 * progress.
 */
@Injectable()
export class CampaignSenderService {
  private readonly logger = new Logger(CampaignSenderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async run(campaignId: string): Promise<void> {
    const campaign = await this.prisma.newsletterCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return;

    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { status: SubscriberStatus.CONFIRMED },
      select: { email: true, unsubscribe_token: true },
    });

    await this.prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.SENDING, recipient_count: subscribers.length, sent_count: 0 },
    });

    const frontendUrl = getFrontendUrl(this.config);
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (sub) => {
          const unsubscribeUrl = `${frontendUrl}/newsletter/unsubscribe?token=${sub.unsubscribe_token}`;
          try {
            await this.email.sendNewsletterCampaign(sub.email, campaign.subject, campaign.content, unsubscribeUrl);
          } catch (error: any) {
            failed += 1;
            this.logger.warn(
              `Campaign ${campaignId} failed for ${sub.email}: ${error?.message ?? 'unknown'}`,
            );
          }
        }),
      );

      // sent_count tracks "processed", not "confirmed delivered" — ZeptoMail
      // accepting the send is the only signal available without webhooks.
      sent += batch.length;
      await this.prisma.newsletterCampaign.update({
        where: { id: campaignId },
        data: { sent_count: sent },
      });

      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    await this.prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.SENT, sent_at: new Date() },
    });

    this.logger.log(
      `Campaign ${campaignId} finished — ${sent - failed}/${subscribers.length} sent, ${failed} failed`,
    );
  }
}
