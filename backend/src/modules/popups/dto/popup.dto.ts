import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  IsEnum,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PopupPosition {
  HEADER = 'header',
  FOOTER = 'footer',
  LEFT = 'left',
  RIGHT = 'right',
}

export class CreatePopupDto {
  @ApiProperty({ description: 'Título del popup', example: 'Frutas Frescas' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'ID del medio (imagen)', example: 1 })
  @IsInt()
  imageMediaId: number;

  @ApiPropertyOptional({
    enum: PopupPosition,
    description: 'Posición del popup',
    default: 'header',
  })
  @IsOptional()
  @IsEnum(PopupPosition)
  position?: PopupPosition;

  @ApiPropertyOptional({
    description: 'Configuración de filtros (JSON)',
    example: { categoryIds: [1, 2], sort: 'relevancia' },
  })
  @IsOptional()
  @IsObject()
  filterConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Duración en milisegundos', default: 7000 })
  @IsOptional()
  @IsInt()
  durationMs?: number;

  @ApiPropertyOptional({ description: 'Delay en milisegundos', default: 1500 })
  @IsOptional()
  @IsInt()
  delayMs?: number;

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

export class UpdatePopupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  imageMediaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PopupPosition)
  position?: PopupPosition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  filterConfig?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  durationMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  delayMs?: number;

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
