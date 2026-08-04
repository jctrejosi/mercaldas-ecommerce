import { IsString, IsOptional, IsBoolean, IsInt, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFilterDto {
  @ApiProperty({ description: 'Nombre del filtro' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'IDs de categorías' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({ description: 'ID de marca' })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @ApiPropertyOptional({ description: 'Código de tipo de producto' })
  @IsOptional()
  @IsString()
  productTypeCode?: string;

  @ApiPropertyOptional({ description: 'Solo en oferta' })
  @IsOptional()
  @IsBoolean()
  onSale?: boolean;

  @ApiPropertyOptional({ description: 'Término de búsqueda' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Ordenamiento' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'Precio mínimo' })
  @IsOptional()
  @IsInt()
  priceMin?: number;

  @ApiPropertyOptional({ description: 'Precio máximo' })
  @IsOptional()
  @IsInt()
  priceMax?: number;

  @ApiPropertyOptional({ description: 'Activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFilterDto extends CreateFilterDto {}
