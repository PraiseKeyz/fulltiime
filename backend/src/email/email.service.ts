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
  private readonly configured: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly templateService: EmailTemplateService,
  ) {
    const rawKey = this.config.get<string>('ZEPTOMAIL_API_KEY');
    this.senderEmail = this.config.get<string>('ZEPTOMAIL_FROM_EMAIL') ?? 'no-reply@fulltiime.com';
    this.senderName = this.config.get<string>('ZEPTOMAIL_FROM_NAME') ?? 'Fulltiime';
    this.configured = !!rawKey;

    if (!this.configured) {
      this.logger.warn('ZEPTOMAIL_API_KEY is not set — all emails will be skipped.');
    }

    // ZeptoMail auth: "Authorization: Zoho-enczapikey <key>". Accept the key
    // with or without the prefix already included.
    const authHeader = rawKey?.startsWith('Zoho-enczapikey')
      ? rawKey
      : `Zoho-enczapikey ${rawKey}`;

    this.http = axios.create({
      baseURL: this.config.get<string>('ZEPTOMAIL_API_BASE_URL') ?? 'https://api.zeptomail.com',
      timeout: 15_000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.configured ? { Authorization: authHeader } : {}),
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to Fulltiime';
    const html = this.templateService.render('welcome', { name });
    await this.sendEmail({ to, subject, html });
  }

  async sendVerificationEmail(to: string, name: string, verifyUrl: string) {
    const subject = 'Verify your Fulltiime account';
    const html = this.templateService.render('verify-email', { name, verifyUrl });
    await this.sendEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    const subject = 'Reset your Fulltiime password';
    const html = this.templateService.render('password-reset', { name, resetUrl });
    await this.sendEmail({ to, subject, html });
  }

  async sendStaffInviteEmail(
    to: string,
    name: string,
    role: string,
    tempPassword: string,
    loginUrl: string,
  ) {
    const subject = `You've been invited to Fulltiime Studio`;
    const html = this.templateService.render('staff-invite', {
      name,
      role,
      tempPassword,
      loginUrl,
    });
    await this.sendEmail({ to, subject, html });
  }

  private async sendEmail(payload: SendEmailPayload) {
    if (!this.configured) {
      this.logger.warn(
        `Email SKIPPED (no API key) — to=${payload.to} subject="${payload.subject}"`,
      );
      return;
    }

    // ZeptoMail transactional email API: POST /v1.1/email
    // https://www.zoho.com/zeptomail/help/api/email-sending.html
    const body = {
      from: { address: this.senderEmail, name: this.senderName },
      to: [{ email_address: { address: payload.to } }],
      subject: payload.subject,
      htmlbody: payload.html,
      textbody: payload.text ?? this.htmlToText(payload.html),
    };

    this.logger.log(`Sending email — to=${payload.to} subject="${payload.subject}"`);

    try {
      const res = await this.http.post('/v1.1/email', body);
      const requestId = res.data?.request_id ?? 'n/a';
      this.logger.log(
        `Email SENT — to=${payload.to} subject="${payload.subject}" request_id=${requestId}`,
      );
    } catch (error: any) {
      const status = error?.response?.status;
      const detail = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error?.message ?? 'unknown error';
      this.logger.error(
        `Email FAILED — to=${payload.to} subject="${payload.subject}" status=${status ?? 'n/a'} detail=${detail}`,
      );
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
