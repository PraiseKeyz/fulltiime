import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service.js';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  @Get('test')
  async testEmail(@Query('to') to?: string) {
    const recipient = to ?? this.config.get<string>('TEST_EMAIL_RECIPIENT') ?? 'test@example.com';
    const apiKeyConfigured = Boolean(this.config.get<string>('ZEPTOMAIL_API_KEY'));
    const fromEmail = this.config.get<string>('ZEPTOMAIL_FROM_EMAIL') ?? 'no-reply@fulltiime.com';
    const fromName = this.config.get<string>('ZEPTOMAIL_FROM_NAME') ?? 'Fulltiime';

    try {
      await this.emailService.sendWelcomeEmail(recipient, 'Email Test User');

      return {
        ok: true,
        message: 'Email send request completed successfully.',
        recipient,
        apiKeyConfigured,
        fromEmail,
        fromName,
      };
    } catch (error: any) {
      const details = {
        ok: false,
        message: 'Email send failed.',
        recipient,
        apiKeyConfigured,
        fromEmail,
        fromName,
        error: {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          stack: error?.stack,
        },
      };

      return details;
    }
  }
}
