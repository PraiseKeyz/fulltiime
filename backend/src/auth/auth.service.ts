import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@/prisma/prisma.service.js';
import { SafeUserSelect } from '@/common/constants/user-select.constant.js';
import { EmailService } from '../email/email.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_TTL_MS  = 60 * 60 * 1000;      // 1 hour

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma:      PrismaService,
    private readonly jwtService:  JwtService,
    private readonly config:      ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get<string>('GOOGLE_CLIENT_ID'));
  }

  // ── Register ──────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Email is already registered'
          : 'Username is already taken',
      );
    }

    const password_hash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email:         dto.email,
        username:      dto.username,
        full_name:     dto.full_name,
        password_hash,
      },
      select: SafeUserSelect,
    });

    // Fire off the email-verification link. Soft flow: the account is usable
    // immediately (no guard enforces verification yet) — this just lets them
    // confirm ownership. The welcome email is sent once they verify.
    await this.issueVerificationEmail(user.id, user.email, user.full_name ?? user.username);

    const { access_token, refresh_token } = await this.signAndStoreTokens(user.id, user.email);
    return { user, access_token, refresh_token };
  }

  // ── Email verification ────────────────────────────────────────────────────────

  async verifyEmail(rawToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { verification_token: this.hashToken(rawToken) },
    });

    if (!user || !user.verification_expires || user.verification_expires < new Date()) {
      throw new BadRequestException('Verification link is invalid or has expired');
    }

    const verified = await this.prisma.user.update({
      where: { id: user.id },
      data:  { is_verified: true, verification_token: null, verification_expires: null },
      select: SafeUserSelect,
    });

    try {
      await this.emailService.sendWelcomeEmail(verified.email, verified.full_name ?? verified.username);
    } catch (error: any) {
      this.logger.warn(`Welcome email failed for ${verified.email}: ${error?.message ?? 'unknown'}`);
    }

    return { user: verified };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Only act for a real, still-unverified account — but always return the same
    // message so we never leak whether an email is registered.
    if (user && !user.is_verified) {
      await this.issueVerificationEmail(user.id, user.email, user.full_name ?? user.username);
    }

    return { message: 'If an unverified account exists for that email, a new verification link has been sent.' };
  }

  // ── Password reset ──────────────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = this.generateRawToken();
      await this.prisma.user.update({
        where: { id: user.id },
        data:  {
          reset_token:   this.hashToken(rawToken),
          reset_expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${this.frontendUrl}/reset-password?token=${rawToken}`;
      try {
        await this.emailService.sendPasswordResetEmail(user.email, user.full_name ?? user.username, resetUrl);
      } catch (error: any) {
        this.logger.warn(`Password reset email failed for ${user.email}: ${error?.message ?? 'unknown'}`);
      }
    }

    // Same response whether or not the account exists.
    return { message: 'If an account exists for that email, a password reset link has been sent.' };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { reset_token: this.hashToken(rawToken) },
    });

    if (!user || !user.reset_expires || user.reset_expires < new Date()) {
      throw new BadRequestException('Reset link is invalid or has expired');
    }

    const password_hash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data:  {
        password_hash,
        reset_token:   null,
        reset_expires: null,
        refresh_token: null, // invalidate any existing sessions
      },
    });

    return { message: 'Password has been reset. You can now log in with your new password.' };
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.identifier }, { username: dto.identifier }] },
    });

    if (!user || !user.password_hash) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.password_hash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const safeUser = await this.prisma.user.findUnique({
      where:  { id: user.id },
      select: SafeUserSelect,
    });

    const { access_token, refresh_token } = await this.signAndStoreTokens(user.id, user.email);
    return { user: safeUser, access_token, refresh_token };
  }

  // ── Google sign-in ───────────────────────────────────────────────────────────

  async loginWithGoogle(credential: string) {
    const audience = this.config.get<string>('GOOGLE_CLIENT_ID');

    let payload: { sub: string; email?: string; name?: string; picture?: string; email_verified?: boolean };
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken: credential, audience });
      const verified = ticket.getPayload();
      if (!verified?.email) throw new Error('Missing email in Google token');
      payload = verified;
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ google_id: payload.sub }, { email: payload.email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email:       payload.email!,
          username:    await this.uniqueUsernameFromEmail(payload.email!),
          full_name:   payload.name,
          avatar_url:  payload.picture,
          google_id:   payload.sub,
          is_verified: payload.email_verified ?? true,
        },
      });
    } else if (!user.google_id) {
      // Link the Google account to the existing email/password account
      user = await this.prisma.user.update({
        where: { id: user.id },
        data:  { google_id: payload.sub, is_verified: true },
      });
    }

    const safeUser = await this.prisma.user.findUnique({
      where:  { id: user.id },
      select: SafeUserSelect,
    });

    const { access_token, refresh_token } = await this.signAndStoreTokens(user.id, user.email);
    return { user: safeUser, access_token, refresh_token };
  }

  // ── Refresh access token ──────────────────────────────────────────────────────

  async refresh(incomingRefreshToken: string) {
    let payload: { sub: string; email: string };

    try {
      payload = this.jwtService.verify(incomingRefreshToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refresh_token) throw new UnauthorizedException('Session expired, please log in again');

    const valid = await argon2.verify(user.refresh_token, incomingRefreshToken);
    if (!valid) throw new UnauthorizedException('Refresh token mismatch');

    // Rotate refresh token on each use
    const { access_token, refresh_token } = await this.signAndStoreTokens(user.id, user.email);
    return { access_token, refresh_token };
  }

  // ── Logout ───────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data:  { refresh_token: null },
    });
  }

  // ── Me ───────────────────────────────────────────────────────────────────────

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: SafeUserSelect,
    });
    return user;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  // Generate, store and email a fresh verification link for a user.
  private async issueVerificationEmail(userId: string, email: string, name: string) {
    const rawToken = this.generateRawToken();
    await this.prisma.user.update({
      where: { id: userId },
      data:  {
        verification_token:   this.hashToken(rawToken),
        verification_expires: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
      },
    });

    const verifyUrl = `${this.frontendUrl}/verify-email?token=${rawToken}`;
    try {
      await this.emailService.sendVerificationEmail(email, name, verifyUrl);
    } catch (error: any) {
      this.logger.warn(`Verification email failed for ${email}: ${error?.message ?? 'unknown'}`);
    }
  }

  // Derive a username from an email's local-part, appending a random suffix
  // if it's already taken so Google sign-ups never collide.
  private async uniqueUsernameFromEmail(email: string): Promise<string> {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'fan';
    const candidate = base.length >= 3 ? base : `${base}fan`;

    const existing = await this.prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;

    return `${candidate}${randomBytes(3).toString('hex')}`;
  }

  // High-entropy token sent in the email link; only its sha256 hash is stored.
  private generateRawToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  // Base URL for links in emails. FRONTEND_URL may be a comma-separated list
  // (shared with CORS) — use the first entry.
  private get frontendUrl(): string {
    const raw   = this.config.get<string>('FRONTEND_URL') ?? '';
    const first = raw.split(',').map((s) => s.trim()).find(Boolean);
    return (first ?? 'http://localhost:3000').replace(/\/$/, '');
  }

  private async signAndStoreTokens(userId: string, email: string) {
    const payload       = { sub: userId, email };
    const access_token  = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store hashed refresh token so we can invalidate it on logout
    const hashed = await argon2.hash(refresh_token);
    await this.prisma.user.update({
      where: { id: userId },
      data:  { refresh_token: hashed },
    });

    return { access_token, refresh_token };
  }
}
