import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, IsEnum, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DiscountType {
  PORCENTAJE = 'porcentaje',
  FIJO = 'fijo',
  CUPON = 'cupon',
}

export class CreatePromotionDto {
  @ApiProperty({ description: 'Nombre de la promoción', example: 'Flash Sale Viernes' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción de la promoción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType, description: 'Tipo de descuento' })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Valor del descuento (porcentaje o monto fijo)', example: 30 })
  @IsInt()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ description: 'Código de cupón (requerido si discountType es cupon)' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Máximo de usos totales del cupón' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesTotal?: number;

  @ApiPropertyOptional({ description: 'Máximo de usos por cliente' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesPerCustomer?: number;

  @ApiPropertyOptional({ description: 'Límite de usos de la promoción' })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiProperty({ description: 'Fecha de inicio', example: '2026-08-04T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Fecha de fin', example: '2026-08-31T23:59:59.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Aplicar automáticamente', default: false })
  @IsOptional()
  @IsBoolean()
  isAutoApply?: boolean;

  @ApiPropertyOptional({ description: 'Prioridad (mayor = más prioridad)', default: 0 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ description: 'Aplicable con otras promociones', default: false })
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiPropertyOptional({ description: 'Exclusiva (no combina con otras)', default: false })
  @IsOptional()
  @IsBoolean()
  exclusive?: boolean;

  @ApiPropertyOptional({ description: 'Activa', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional({ description: 'Nombre de la promoción' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción de la promoción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesPerCustomer?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAutoApply?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  exclusive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryPromotionsDto {
  @ApiPropertyOptional({ description: 'Filtrar por estado: activo, programado, expirado, inactivo' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Buscar por nombre o código de cupón' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar promociones con usos hoy' })
  @IsOptional()
  @IsString()
  usagesToday?: string;

  @ApiPropertyOptional({ description: 'Límite de resultados' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({ description: 'Offset para paginación' })
  @IsOptional()
  @IsString()
  offset?: string;
}
