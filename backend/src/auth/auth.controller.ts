import {
  Body, Controller, Get, Post,
  Req, Res, UseGuards, HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from '@/common/decorators/public.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { SafeUser } from '@/common/constants/user-select.constant.js';

const COOKIE_OPTIONS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  'strict' as const,
  maxAge:    7 * 24 * 60 * 60 * 1000, // 7 days
  path:      '/api/v1/auth',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Register ──────────────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  @HttpCode(201)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token, refresh_token } = await this.authService.register(dto);
    res.cookie('refresh_token', refresh_token, COOKIE_OPTIONS);
    return {
      data:    { user, access_token },
      message: 'Account created successfully',
    };
  }

  // ── Login ─────────────────────────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token, refresh_token } = await this.authService.login(dto);
    res.cookie('refresh_token', refresh_token, COOKIE_OPTIONS);
    return {
      data:    { user, access_token },
      message: 'Login successful',
    };
  }

  // ── Refresh ───────────────────────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('No refresh token provided');

    const { access_token, refresh_token } = await this.authService.refresh(token);
    res.cookie('refresh_token', refresh_token, COOKIE_OPTIONS);
    return {
      data:    { access_token },
      message: 'Token refreshed',
    };
  }

  // ── Logout ────────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() user: SafeUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { message: 'Logged out successfully' };
  }

  // ── Me ────────────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: SafeUser) {
    const data = await this.authService.me(user.id);
    return { data, message: 'User fetched successfully' };
  }
}
