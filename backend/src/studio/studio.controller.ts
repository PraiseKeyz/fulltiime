import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudioService } from './studio.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import {
  CreateStaffDto,
  ListArticlesQuery,
  PinArticleDto,
  RejectArticleDto,
  UpdateRoleDto,
} from './dto/studio.dto.js';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '@/auth/guards/roles.guard.js';
import { MinRole } from '@/common/decorators/roles.decorator.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { SafeUser } from '@/common/constants/user-select.constant.js';
import { Role } from '../../generated/prisma/index.js';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.WRITER)
@Controller('studio')
export class StudioController {
  constructor(private readonly studio: StudioService) {}

  // ── Articles ───────────────────────────────────────────────────────────────

  @Get('articles')
  listArticles(@CurrentUser() user: SafeUser, @Query() query: ListArticlesQuery) {
    return this.studio.listArticles(user, query);
  }

  @Get('articles/:id')
  getArticle(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return this.studio.getArticle(id, user);
  }

  @Post('articles')
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateArticleDto) {
    return this.studio.create(user, dto);
  }

  @Patch('articles/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: Partial<CreateArticleDto>,
  ) {
    return this.studio.update(id, user, dto);
  }

  @Delete('articles/:id')
  remove(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return this.studio.remove(id, user);
  }

  // ── Workflow ───────────────────────────────────────────────────────────────

  @Post('articles/:id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return this.studio.submit(id, user);
  }

  @MinRole(Role.EDITOR)
  @Post('articles/:id/publish')
  publish(@Param('id') id: string) {
    return this.studio.publish(id);
  }

  @MinRole(Role.EDITOR)
  @Post('articles/:id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectArticleDto) {
    return this.studio.reject(id, dto.note);
  }

  @MinRole(Role.EDITOR)
  @Post('articles/:id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.studio.unpublish(id);
  }

  // ── Homepage curation ──────────────────────────────────────────────────────

  @MinRole(Role.EDITOR)
  @Post('articles/:id/feature')
  feature(@Param('id') id: string) {
    return this.studio.feature(id);
  }

  @MinRole(Role.EDITOR)
  @Post('articles/:id/pin')
  pin(@Param('id') id: string, @Body() dto: PinArticleDto) {
    return this.studio.pin(id, dto.pin_order);
  }

  // ── Media ──────────────────────────────────────────────────────────────────

  @Post('media')
  @UseInterceptors(FileInterceptor('file'))
  uploadMedia(
    @CurrentUser() user: SafeUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_BYTES }),
          new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif|avif)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.studio.uploadMedia(user, file);
  }

  @Get('media')
  listMedia(
    @CurrentUser() user: SafeUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.studio.listMedia(
      user,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  // ── User administration ────────────────────────────────────────────────────

  @MinRole(Role.ADMIN)
  @Get('users')
  listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.studio.listUsers(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      search,
    );
  }

  @MinRole(Role.ADMIN)
  @Post('users')
  createStaff(@Body() dto: CreateStaffDto) {
    return this.studio.createStaff(dto);
  }

  @MinRole(Role.ADMIN)
  @Patch('users/:id/role')
  updateRole(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.studio.updateRole(user.id, id, dto.role);
  }
}
