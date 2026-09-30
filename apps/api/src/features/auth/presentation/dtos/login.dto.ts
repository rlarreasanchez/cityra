import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail(
    {},
    {
      message: "El email debe ser una dirección de correo electrónico válida",
    }
  )
  @MaxLength(255, {
    message: "El email debe tener como máximo 255 caracteres",
  })
  email!: string;

  @ApiProperty({ example: "password123" })
  @MinLength(1, {
    message: "La contraseña es obligatoria",
  })
  password!: string;
}
