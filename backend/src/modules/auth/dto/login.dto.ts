import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El nombre de usuario debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  })
  @MaxLength(60, {
    message: 'El nombre de usuario no puede exceder los 60 caracteres',
  })
  username!: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password!: string;
}
