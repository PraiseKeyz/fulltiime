import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller.js';
import { NewsletterAdminController } from './newsletter-admin.controller.js';
import { NewsletterService } from './newsletter.service.js';
import { CampaignSenderService } from './campaign-sender.service.js';
import { PrismaModule } from '@/prisma/prisma.module.js';
import { EmailModule } from '@/email/email.module.js';

@Module({
  imports:     [PrismaModule, EmailModule],
  controllers: [NewsletterController, NewsletterAdminController],
  providers:   [NewsletterService, CampaignSenderService],
  exports:     [NewsletterService],
})
export class NewsletterModule {}
