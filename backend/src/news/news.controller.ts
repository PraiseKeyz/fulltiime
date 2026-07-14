import { Controller, Get, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service.js';
import { Public } from '@/common/decorators/public.decorator.js';
import { Section } from '../../generated/prisma/index.js';

/** Public reads only — authoring and workflow live under /studio. */
@Public()
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(
    @Query('section') section?: Section,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.newsService.findAll({
      section,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });
  }

  // Must be declared before :slug so "home" is not swallowed by the param route.
  @Get('home')
  home() {
    return this.newsService.home();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.newsService.findOne(slug);
  }

  // Declared after :slug — this is a sub-resource of one article, not a
  // top-level route, so it never collides with "home" or the slug route above.
  @Get(':slug/related')
  related(@Param('slug') slug: string, @Query('limit') limit?: string) {
    return this.newsService.related(slug, limit ? Number(limit) : undefined);
  }
}
