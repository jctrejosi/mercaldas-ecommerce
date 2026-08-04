import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BannerType {
  HERO = 'hero',
  PROMO = 'promo',
  SIDEBAR = 'sidebar',
  FOOTER = 'footer',
}

export class CreateBannerDto {
  @ApiProperty({ description: 'Título del banner', example: 'Oferta Semanal' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ description: 'Subtítulo (para hero slides)' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID del medio (imagen principal)', example: 1 })
  @IsInt()
  mediaId: number;

  @ApiPropertyOptional({ description: 'ID de imagen para móvil' })
  @IsOptional()
  @IsInt()
  mobileImageId?: number;

  @ApiPropertyOptional({ description: 'URL de destino', example: '/ofertas/frutas' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Target del link', default: '_self' })
  @IsOptional()
  @IsString()
  linkTarget?: string;

  @ApiPropertyOptional({ description: 'Texto alternativo' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Texto del CTA', example: 'Ver Frutas y Verduras' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaText?: string;

  @ApiPropertyOptional({ description: 'Color de fondo (hex)', example: '#1A1A2E' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bgColor?: string;

  @ApiPropertyOptional({ description: 'Color de acento (hex)', example: '#FFF200' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  accentColor?: string;

  @ApiPropertyOptional({ enum: BannerType, description: 'Tipo de banner', default: 'promo' })
  @IsOptional()
  @IsEnum(BannerType)
  bannerType?: BannerType;

  @ApiPropertyOptional({ description: 'Prioridad (número entero)', default: 0 })
  @IsOptional()
  @IsInt()
  position?: number;

  @ApiPropertyOptional({ description: 'ID de filtro guardado para redirección' })
  @IsOptional()
  @IsInt()
  filterId?: number;

  @ApiPropertyOptional({ description: 'Activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de inicio programada' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin programada' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateBannerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  mediaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  mobileImageId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkTarget?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bgColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(BannerType)
  bannerType?: BannerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  filterId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class QueryBannersDto {
  @ApiPropertyOptional({ description: 'Filtrar por bannerType: hero, promo, sidebar, footer' })
  @IsOptional()
  @IsString()
  bannerType?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado: activo, programado, inactivo, expirado' })
  @IsOptional()
  @IsString()
  status?: string;
}
