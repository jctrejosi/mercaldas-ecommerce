import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CustomerRegisterDto {
  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'nuevo@tienda.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña del cliente',
    example: 'cliente123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(128, {
    message: 'La contraseña no puede exceder los 128 caracteres',
  })
  password!: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  firstName!: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(100, {
    message: 'El apellido no puede exceder los 100 caracteres',
  })
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Teléfono del cliente',
    example: '3001234567',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MaxLength(50, { message: 'El teléfono no puede exceder los 50 caracteres' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Número de documento',
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'El documento debe ser un texto' })
  @MaxLength(50, {
    message: 'El documento no puede exceder los 50 caracteres',
  })
  documentNumber?: string;

  @ApiPropertyOptional({
    description: 'Tipo de documento',
    example: 'CC',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @MaxLength(20, {
    message: 'El tipo de documento no puede exceder los 20 caracteres',
  })
  documentType?: string;

  @ApiPropertyOptional({
    description: 'Acepta recibir comunicaciones de marketing',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'acceptsMarketing debe ser un valor booleano' })
  acceptsMarketing?: boolean;

  @ApiProperty({
    description: 'Aceptación de términos y condiciones',
    example: true,
  })
  @IsBoolean({ message: 'acceptsTerms debe ser un valor booleano' })
  acceptsTerms!: boolean;
}
