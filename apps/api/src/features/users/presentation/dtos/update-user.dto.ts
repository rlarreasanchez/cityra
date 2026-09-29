import { UserRole } from "@cityra/domain";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "matchesPassword" })
class MatchesPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const dto = args.object as UpdateUserDto;
    return value === dto.password;
  }

  defaultMessage(): string {
    return "La confirmación debe coincidir con la contraseña";
  }
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({
    message: "El nombre debe ser una cadena de texto",
  })
  @MinLength(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  })
  @MaxLength(100, {
    message: "El nombre debe tener como máximo 100 caracteres",
  })
  name?: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: "El email debe ser una dirección de correo electrónico válida",
    }
  )
  @MaxLength(255, {
    message: "El email debe tener como máximo 255 caracteres",
  })
  email?: string;

  @IsOptional()
  @IsString({
    message: "La contraseña debe ser una cadena de texto",
  })
  @MinLength(8, {
    message: "La contraseña debe tener al menos 8 caracteres",
  })
  @MaxLength(100, {
    message: "La contraseña debe tener como máximo 100 caracteres",
  })
  password?: string;

  @ValidateIf((dto: UpdateUserDto) => dto.password != null)
  @IsString({
    message: "La confirmación de contraseña debe ser una cadena de texto",
  })
  @Validate(MatchesPasswordConstraint)
  confirmPassword?: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: "El rol no es válido",
  })
  role?: UserRole;

  @IsOptional()
  @IsBoolean({
    message: "isActive debe ser un valor booleano",
  })
  isActive?: boolean;
}
