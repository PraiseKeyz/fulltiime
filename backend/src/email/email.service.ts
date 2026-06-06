import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { EmailTemplateService } from './email-template.service.js';

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly http: AxiosInstance;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly apiKey: string | undefined;

  constructor(
    private readonly config: ConfigService,
    private readonly templateService: EmailTemplateService,
  ) {
    this.apiKey = this.config.get<string>('ZEPTOMAIL_API_KEY');
    this.senderEmail = this.config.get<string>('ZEPTOMAIL_FROM_EMAIL') ?? 'no-reply@fulltiime.com';
    this.senderName = this.config.get<string>('ZEPTOMAIL_FROM_NAME') ?? 'Fulltiime';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    this.http = axios.create({
      baseURL: this.config.get<string>('ZEPTOMAIL_API_BASE_URL') ?? 'https://api.zeptomail.com/v1',
      timeout: 15_000,
      headers,
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to Fulltiime';
    const html = await this.templateService.render('welcome', { name });
    await this.sendEmail({ to, subject, html });
  }

  async sendVerificationEmail(to: string, name: string, verifyUrl: string) {
    const subject = 'Verify your Fulltiime account';
    const html = await this.templateService.render('verify-email', { name, verifyUrl });
    await this.sendEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    const subject = 'Reset your Fulltiime password';
    const html = await this.templateService.render('password-reset', { name, resetUrl });
    await this.sendEmail({ to, subject, html });
  }

  private async sendEmail(payload: SendEmailPayload) {
    if (!this.apiKey) {
      this.logger.warn('ZeptoMail API key is not configured. Skipping email send.');
      return;
    }

    const body = {
      personalizations: [
        {
          to: [{ email: payload.to }],
        },
      ],
      from: {
        email: this.senderEmail,
        name: this.senderName,
      },
      subject: payload.subject,
      content: [
        { type: 'text/plain', value: payload.text ?? this.htmlToText(payload.html) },
        { type: 'text/html', value: payload.html },
      ],
    };

    try {
      await this.http.post('/send', body);
      this.logger.log(`Email sent to ${payload.to}`);
    } catch (error: any) {
      this.logger.error(`ZeptoMail send failed: ${error.message}`);
      throw error;
    }
  }

  private htmlToText(html: string) {
    return html
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .trim();
  }
}
