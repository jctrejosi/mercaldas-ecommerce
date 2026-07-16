import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CustomerSocialLoginDto {
  @ApiProperty({
    description: 'Proveedor de autenticación social',
    example: 'google',
    enum: ['google', 'facebook'],
  })
  @IsString({ message: 'El proveedor debe ser un texto' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  @IsIn(['google', 'facebook'], {
    message: 'El proveedor debe ser google o facebook',
  })
  provider!: 'google' | 'facebook';

  @ApiProperty({
    description: 'Token de acceso del proveedor social',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'El token de acceso debe ser un texto' })
  @IsNotEmpty({ message: 'El token de acceso es obligatorio' })
  accessToken!: string;

  @ApiPropertyOptional({
    description: 'ID del usuario en el proveedor social',
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'El providerId debe ser un texto' })
  @MaxLength(255, { message: 'El providerId no puede exceder los 255 caracteres' })
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del cliente',
    example: 'cliente@gmail.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(200, { message: 'El nombre no puede exceder los 200 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL del avatar del cliente',
    example: 'https://lh3.googleusercontent.com/a/...',
  })
  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser un texto' })
  avatarUrl?: string;
}
