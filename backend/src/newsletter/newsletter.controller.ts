import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { NewsletterService } from './newsletter.service.js';
import { SubscribeDto } from './dto/subscribe.dto.js';
import { TokenDto } from './dto/token.dto.js';
import { Public } from '@/common/decorators/public.decorator.js';

@Public()
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(200)
  // Public, unauthenticated, one email per attempt — tighter than the global
  // 120/min default to blunt sign-up spam.
  @Throttle({ global: { limit: 5, ttl: 60_000 } })
  async subscribe(@Body() dto: SubscribeDto) {
    return this.newsletter.subscribe(dto.email);
  }

  @Post('unsubscribe')
  @HttpCode(200)
  async unsubscribe(@Body() dto: TokenDto) {
    return this.newsletter.unsubscribe(dto.token);
  }
}
