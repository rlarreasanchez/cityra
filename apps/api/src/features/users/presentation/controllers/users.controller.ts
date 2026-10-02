import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import {
  ApiNotFoundErrorResponse,
  ApiValidationErrorResponse,
} from "@core/swagger/decorators/error-response.decorator.js";
import {
  ApiCreatedResponseType,
  ApiDeletedResponseType,
  ApiResponseType,
  ApiUpdatedResponseType,
} from "@core/swagger/decorators/response.decorator.js";
import { UsersService } from "../../application/users.service.js";
import { CreateUserDto } from "../dtos/create-user.dto.js";
import { UpdateUserDto } from "../dtos/update-user.dto.js";
import { UserPresenter } from "../presenters/user.presenter.js";

@Controller("users")
@ApiTags("Users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiResponseType(UserPresenter, true)
  async getUsers(): Promise<UserPresenter[]> {
    const users = await this.usersService.getUsers();
    return UserPresenter.fromDomainList(users);
  }

  @Get(":id")
  @ApiResponseType(UserPresenter, false)
  @ApiNotFoundErrorResponse({
    description: "El usuario no existe",
    errorToken: "USER_NOT_FOUND",
  })
  async getUserById(@Param("id") id: string): Promise<UserPresenter> {
    const user = await this.usersService.getUserById(id);
    return UserPresenter.fromDomain(user);
  }

  @Post()
  @ApiCreatedResponseType(UserPresenter, false)
  @ApiValidationErrorResponse({
    description: "Errores de validación o email ya registrado",
    validationErrors: { email: ["El email ya está registrado"] },
  })
  async createUser(@Body() dto: CreateUserDto): Promise<UserPresenter> {
    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });
    return UserPresenter.fromDomain(user);
  }

  @Patch(":id")
  @ApiUpdatedResponseType(UserPresenter, false)
  @ApiValidationErrorResponse({
    description: "Errores de validación o email ya registrado",
    validationErrors: { email: ["El email ya está registrado"] },
  })
  @ApiNotFoundErrorResponse({
    description: "El usuario no existe",
    errorToken: "USER_NOT_FOUND",
  })
  async updateUser(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto
  ): Promise<UserPresenter> {
    const user = await this.usersService.updateUser(id, {
      name: dto.name,
      email: dto.email,
      role: dto.role,
      isActive: dto.isActive,
      password: dto.password,
    });
    return UserPresenter.fromDomain(user);
  }

  @Delete(":id")
  @ApiDeletedResponseType("El usuario fue eliminado correctamente")
  @ApiNotFoundErrorResponse({
    description: "El usuario no existe",
    errorToken: "USER_NOT_FOUND",
  })
  async deleteUser(@Param("id") id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
