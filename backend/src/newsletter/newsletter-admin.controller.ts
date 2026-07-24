import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service.js';
import { CreateCampaignDto, ListSubscribersQuery, UpdateCampaignDto } from './dto/newsletter-admin.dto.js';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '@/auth/guards/roles.guard.js';
import { MinRole } from '@/common/decorators/roles.decorator.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { SafeUser } from '@/common/constants/user-select.constant.js';
import { Role } from '../../generated/prisma/index.js';

/** Admin-only — subscriber list management and campaign composing/sending. */
@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.ADMIN)
@Controller('studio/newsletter')
export class NewsletterAdminController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Get('subscribers')
  listSubscribers(@Query() query: ListSubscribersQuery) {
    return this.newsletter.listSubscribers(query);
  }

  @Delete('subscribers/:id')
  deleteSubscriber(@Param('id') id: string) {
    return this.newsletter.deleteSubscriber(id);
  }

  @Get('campaigns')
  listCampaigns() {
    return this.newsletter.listCampaigns();
  }

  @Get('campaigns/:id')
  getCampaign(@Param('id') id: string) {
    return this.newsletter.getCampaign(id);
  }

  @Post('campaigns')
  createCampaign(@CurrentUser() user: SafeUser, @Body() dto: CreateCampaignDto) {
    return this.newsletter.createCampaign(user.id, dto);
  }

  @Patch('campaigns/:id')
  updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.newsletter.updateCampaign(id, dto);
  }

  @Delete('campaigns/:id')
  deleteCampaign(@Param('id') id: string) {
    return this.newsletter.deleteCampaign(id);
  }

  @Post('campaigns/:id/send-test')
  sendTest(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return this.newsletter.sendTest(id, user.email);
  }

  @Post('campaigns/:id/send')
  send(@Param('id') id: string) {
    return this.newsletter.send(id);
  }
}
