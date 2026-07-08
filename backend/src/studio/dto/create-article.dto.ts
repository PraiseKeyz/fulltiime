import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ArticleCategory } from '../../../generated/prisma/index.js';

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @IsString()
  @MinLength(50)
  content: string;

  @IsOptional()
  @IsUrl()
  cover_url?: string;

  @IsEnum(ArticleCategory)
  category: ArticleCategory;

  @IsBoolean()
  is_published: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
