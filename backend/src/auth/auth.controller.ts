import {
  Body, Controller, Get, Post,
  Query, Req, Res, UseGuards, HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { ResendVerificationDto } from './dto/resend-verification.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { Public } from '@/common/decorators/public.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { SafeUser } from '@/common/constants/user-select.constant.js';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const BASE_COOKIE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

// Access token: sent to every API route, short-lived (matches the 15m JWT expiry)
const ACCESS_COOKIE_OPTIONS = {
  ...BASE_COOKIE,
  maxAge: 15 * 60 * 1000, // 15 minutes
  path:   '/',
};

// Refresh token: only sent to the auth endpoints that need it, long-lived
const REFRESH_COOKIE_OPTIONS = {
  ...BASE_COOKIE,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path:   '/api/v1/auth',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Register ──────────────────────────────────────────────────────────────────

  @Public()
  @Get('check-username')
  checkUsername(@Query('username') username: string) {
    return this.authService.checkUsername(username);
  }

  @Public()
  @Post('register')
  @HttpCode(201)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token, refresh_token } = await this.authService.register(dto);
    res.cookie(ACCESS_COOKIE, access_token, ACCESS_COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE, refresh_token, REFRESH_COOKIE_OPTIONS);
    return {
      data:    { user },
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
    res.cookie(ACCESS_COOKIE, access_token, ACCESS_COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE, refresh_token, REFRESH_COOKIE_OPTIONS);
    return {
      data:    { user },
      message: 'Login successful',
    };
  }

  // ── Google sign-in ────────────────────────────────────────────────────────────

  @Public()
  @Post('google')
  @HttpCode(200)
  async google(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token, refresh_token } = await this.authService.loginWithGoogle(dto.credential);
    res.cookie(ACCESS_COOKIE, access_token, ACCESS_COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE, refresh_token, REFRESH_COOKIE_OPTIONS);
    return {
      data:    { user },
      message: 'Login successful',
    };
  }

  // ── Verify email ────────────────────────────────────────────────────────────────

  @Public()
  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const { user } = await this.authService.verifyEmail(dto.token);
    return { data: { user }, message: 'Email verified successfully' };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(200)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    const { message } = await this.authService.resendVerification(dto.email);
    return { message };
  }

  // ── Password reset ────────────────────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const { message } = await this.authService.forgotPassword(dto.email);
    return { message };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const { message } = await this.authService.resetPassword(dto.token, dto.password);
    return { message };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  changePassword(@CurrentUser() user: SafeUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto.current_password, dto.new_password);
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
    res.cookie(ACCESS_COOKIE, access_token, ACCESS_COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE, refresh_token, REFRESH_COOKIE_OPTIONS);
    return {
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
    res.clearCookie(ACCESS_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
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
