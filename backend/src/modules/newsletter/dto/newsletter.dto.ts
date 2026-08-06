import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsInt,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ description: 'Correo del suscriptor', example: 'user@mail.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Nombre del suscriptor' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({
    description: 'Acepta términos y condiciones del newsletter',
    example: true,
  })
  @IsBoolean()
  acceptedTerms: boolean;
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Título interno de la campaña' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Asunto del correo' })
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ description: 'Contenido HTML del correo' })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ description: 'URL de imagen del encabezado' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Fecha de envío programada (ISO). Si no se indica, queda en borrador.',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string | null;
}

export class QuerySubscribersDto {
  @ApiPropertyOptional({ description: 'Búsqueda por email o nombre' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado: activo, inactivo, todos' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Página (1-based)' })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Tamaño de página' })
  @IsOptional()
  @IsInt()
  limit?: number;
}
