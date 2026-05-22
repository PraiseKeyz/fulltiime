import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { Public } from '@/common/decorators/public.decorator.js';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { SafeUser } from '@/common/constants/user-select.constant.js';
import { ArticleCategory } from '../../generated/prisma/index.js';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  findAll(
    @Query('category') category?: ArticleCategory,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.newsService.findAll({
      category,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.newsService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateArticleDto) {
    return this.newsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: Partial<CreateArticleDto>,
  ) {
    return this.newsService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return this.newsService.remove(id, user.id);
  }
}
