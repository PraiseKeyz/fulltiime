import { Module } from '@nestjs/common';
import { StudioController } from './studio.controller.js';
import { StudioService } from './studio.service.js';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module.js';
import { EmailModule } from '@/email/email.module.js';

@Module({
  imports:     [CloudinaryModule, EmailModule],
  controllers: [StudioController],
  providers:   [StudioService],
})
export class StudioModule {}
