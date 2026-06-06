import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service.js';
import { EmailTemplateService } from './email-template.service.js';

@Module({
  imports: [ConfigModule],
  providers: [EmailTemplateService, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
