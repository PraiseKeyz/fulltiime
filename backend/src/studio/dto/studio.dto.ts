import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ArticleStatus, Role, Section } from '../../../generated/prisma/index.js';

export class ListArticlesQuery {
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsEnum(Section)
  section?: Section;

  /** Editors+ only — writers are always scoped to their own articles. */
  @IsOptional()
  @IsString()
  author_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class RejectArticleDto {
  /** Feedback for the writer — required so rejections are never silent. */
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  note: string;
}

export class PinArticleDto {
  /** Position in the section rail; null clears the pin. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pin_order?: number | null;
}

export class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;
}

export class CreateStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  full_name?: string;

  /** Staff roles only — promote to ADMIN afterwards via the role endpoint. */
  @IsIn([Role.WRITER, Role.EDITOR])
  role: Role;

  /** Omit to auto-generate a temporary password (returned once). */
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
