import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CustomerLoginDto {
  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'juan@ejemplo.com',
    required: true,
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña del cliente',
    example: 'admin123',
    required: true,
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(128, {
    message: 'La contraseña no puede exceder los 128 caracteres',
  })
  password!: string;
}
