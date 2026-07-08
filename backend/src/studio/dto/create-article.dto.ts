import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Section } from '../../../generated/prisma/index.js';

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  /** Standfirst — shown under the headline and on cards. */
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

  @IsEnum(Section)
  section: Section;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  kicker?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(360)
  hue?: number;

  // ── Section-specific extras ──────────────────────────────────────────────

  /** Transfers: "Viktoria SC → Northgate Utd" */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  move?: string;

  /** Transfers: crest initials, e.g. "NU" */
  @IsOptional()
  @IsString()
  @MaxLength(4)
  crest?: string;

  /** Tactics: formation label, e.g. "4-3-3" */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  formation?: string;

  /** Fulltiime TV */
  @IsOptional()
  @IsUrl()
  video_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  duration?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
