import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ description: 'Código único', example: 'MZ01' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: 'Nombre', example: 'Mercaldas Centro' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Dirección', example: 'Carrera 23 #45-67' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Ciudad', example: 'Manizales' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'Teléfono', example: '3001234567' })
  @IsString()
  @MaxLength(50)
  phone: string;

  @ApiProperty({ description: 'Email', example: 'centro@mercaldas.com' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Store ID', example: 1 })
  @IsInt()
  storeId: number;

  @ApiProperty({ description: 'Nombre del encargado', example: 'Carlos Pérez' })
  @IsString()
  @MaxLength(150)
  managerName: string;

  @ApiProperty({ description: 'Teléfono del encargado', example: '3101112233' })
  @IsString()
  @MaxLength(30)
  managerPhone: string;

  @ApiProperty({ description: 'Coordenadas GPS (lat,lng)', example: '5.067,-75.517' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: 'Prioridad', default: 1 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ description: 'Tipo', default: 'STORE' })
  @IsOptional()
  @IsString()
  branchType?: string;

  @ApiPropertyOptional({ description: 'Radio de entrega (km)', default: 5 })
  @IsOptional()
  @IsNumber()
  deliveryRadiusKm?: number;

  @ApiPropertyOptional({ description: 'Máximo de pedidos diarios' })
  @IsOptional()
  @IsInt()
  maxDailyOrders?: number;

  @ApiPropertyOptional({ description: 'Horario (JSON)' })
  @IsOptional()
  schedule?: any;

  @ApiPropertyOptional({ description: 'Activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBranchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  storeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deliveryRadiusKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  maxDailyOrders?: number;

  @ApiPropertyOptional()
  @IsOptional()
  schedule?: any;

  @ApiPropertyOptional({ description: 'URL de imagen (crea un media)' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateDeliveryZoneDto {
  @ApiProperty({ description: 'Nombre de la zona' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Precio de entrega' })
  @IsNumber()
  deliveryPrice: number;

  @ApiProperty({ description: 'Área de cobertura' })
  @IsString()
  coverageArea: string;

  @ApiProperty({ description: 'Tiempo estimado mínimo (min)' })
  @IsInt()
  estimatedMinMinutes: number;

  @ApiProperty({ description: 'Tiempo estimado máximo (min)' })
  @IsInt()
  estimatedMaxMinutes: number;

  @ApiPropertyOptional({ description: 'Tipo de entrega', default: 'STANDARD' })
  @IsOptional()
  @IsString()
  deliveryType?: string;

  @ApiPropertyOptional({ description: 'Pedido mínimo' })
  @IsOptional()
  @IsNumber()
  minimumOrder?: number;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
