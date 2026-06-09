import { Module } from '@nestjs/common';
import { NewsService } from './news.service.js';
import { NewsController } from './news.controller.js';
import { NewsSyncService } from './news-sync.service.js';
import { RssService } from './rss.service.js';
import { ScraperService } from './scraper.service.js';
import { PrismaModule } from '@/prisma/prisma.module.js';

@Module({
  imports:     [PrismaModule],
  controllers: [NewsController],
  providers:   [NewsService, NewsSyncService, RssService, ScraperService],
  exports:     [NewsSyncService],
})
export class NewsModule {}
