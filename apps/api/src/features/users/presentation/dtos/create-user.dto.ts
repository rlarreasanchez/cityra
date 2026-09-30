import { UserRole } from "@cityra/domain";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "matchesPassword" })
class MatchesPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const dto = args.object as CreateUserDto;
    return value === dto.password;
  }

  defaultMessage(): string {
    return "La confirmación debe coincidir con la contraseña";
  }
}

export class CreateUserDto {
  @ApiProperty({ example: "John Doe" })
  @IsString({
    message: "El nombre es obligatorio",
  })
  @MinLength(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  })
  @MaxLength(100, {
    message: "El nombre debe tener como máximo 100 caracteres",
  })
  name!: string;

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
  @IsString({
    message: "La contraseña debe ser una cadena de texto",
  })
  @MinLength(8, {
    message: "La contraseña debe tener al menos 8 caracteres",
  })
  @MaxLength(100, {
    message: "La contraseña debe tener como máximo 100 caracteres",
  })
  password!: string;

  @ApiProperty({ example: "password123" })
  @IsString({
    message: "La confirmación de contraseña debe ser una cadena de texto",
  })
  @Validate(MatchesPasswordConstraint)
  confirmPassword!: string;

  @ApiProperty({ example: UserRole.TECHNICIAN })
  @IsEnum(UserRole, {
    message: "El rol no es válido",
  })
  role!: UserRole;
}
