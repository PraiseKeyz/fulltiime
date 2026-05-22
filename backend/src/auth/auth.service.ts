import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '@/prisma/prisma.service.js';
import { SafeUserSelect } from '@/common/constants/user-select.constant.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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
        email: dto.email,
        username: dto.username,
        full_name: dto.full_name,
        password_hash,
      },
      select: SafeUserSelect,
    });

    const tokens = await this.signTokens(user.id, user.email);
    return { data: { user, ...tokens }, message: 'Account created successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.password_hash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const safeUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: SafeUserSelect,
    });

    const tokens = await this.signTokens(user.id, user.email);
    return { data: { user: safeUser, ...tokens }, message: 'Login successful' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: SafeUserSelect,
    });
    return { data: user };
  }

  private async signTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { access_token, refresh_token };
  }
}
