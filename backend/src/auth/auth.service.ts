import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '@/prisma/prisma.service.js';
import { SafeUserSelect } from '@/common/constants/user-select.constant.js';
import { EmailService } from '../email/email.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma:      PrismaService,
    private readonly jwtService:  JwtService,
    private readonly config:      ConfigService,
    private readonly emailService: EmailService,
  ) {}

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

    try {
      await this.emailService.sendWelcomeEmail(user.email, user.full_name ?? user.username);
    } catch (error: any) {
      this.logger.warn(`Welcome email failed for ${user.email}: ${error?.message ?? 'unknown'}`);
    }

    const { access_token, refresh_token } = await this.signAndStoreTokens(user.id, user.email);
    return { user, access_token, refresh_token };
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.identifier }, { username: dto.identifier }] },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.password_hash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

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
