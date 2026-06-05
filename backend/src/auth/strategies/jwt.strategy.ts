import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { PrismaService } from '@/prisma/prisma.service.js';
import { SafeUserSelect } from '@/common/constants/user-select.constant.js';

// Read the JWT from the httpOnly access_token cookie (set on login/register)
const cookieExtractor = (req: Request): string | null =>
  (req?.cookies?.access_token as string | undefined) ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // Prefer the cookie; fall back to the Authorization header for API clients
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: SafeUserSelect,
    });

    if (!user) throw new UnauthorizedException('User no longer exists');

    return user;
  }
}
