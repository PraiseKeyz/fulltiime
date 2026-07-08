import { Module } from '@nestjs/common';
import { NewsService } from './news.service.js';
import { NewsController } from './news.controller.js';
import { PrismaModule } from '@/prisma/prisma.module.js';

@Module({
  imports:     [PrismaModule],
  controllers: [NewsController],
  providers:   [NewsService],
})
export class NewsModule {}
