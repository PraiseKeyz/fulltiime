import {
  Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard.js';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'chat');
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;  // 8MB
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // a couple of minutes of voice notes

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_AUDIO = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav'];

// Chat attachments only — images and voice notes for the live-chat feature.
// Stored on local disk (this VPS), served back via the static route registered
// in main.ts. Auth-gated: only signed-in users (the only ones who can send chat
// messages anyway) may upload.
@UseGuards(JwtAuthGuard)
@Controller({ path: 'live-chat/upload', version: '1' })
export class ChatUploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
    }),
    limits: { fileSize: MAX_AUDIO_BYTES },
    fileFilter: (_req, file, cb) => {
      const ok = ALLOWED_IMAGE.includes(file.mimetype) || ALLOWED_AUDIO.includes(file.mimetype);
      cb(ok ? null : new BadRequestException('Unsupported file type'), ok);
    },
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body('duration') duration?: string) {
    if (!file) throw new BadRequestException('No file uploaded');

    const isImage = ALLOWED_IMAGE.includes(file.mimetype);
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Image too large (max 8MB)');
    }

    return {
      data: {
        url:      `/uploads/chat/${file.filename}`,
        type:     isImage ? 'IMAGE' : 'AUDIO',
        duration: !isImage && duration ? parseInt(duration, 10) : null,
      },
    };
  }
}
