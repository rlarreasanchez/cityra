import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

import { ExceptionFormat } from "@core/exceptions/filters/exceptions.filter.js";

import { UsersService } from "../../application/users.service.js";
import { CreateUserDto } from "../dtos/create-user.dto.js";
import { UpdateUserDto } from "../dtos/update-user.dto.js";
import { UserPresenter } from "../presenters/user.presenter.js";

@Controller("users")
@ApiTags("Users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: UserPresenter, isArray: true })
  async getUsers(): Promise<UserPresenter[]> {
    const users = await this.usersService.getUsers();
    return UserPresenter.fromDomainList(users);
  }

  @Get(":id")
  @ApiOkResponse({ type: UserPresenter })
  async getUserById(@Param("id") id: string): Promise<UserPresenter | null> {
    const user = await this.usersService.getUserById(id);
    return user ? UserPresenter.fromDomain(user) : null;
  }

  @Post()
  @ApiCreatedResponse({ type: UserPresenter })
  @ApiBadRequestResponse({
    description: "Errores de validación o email ya registrado",
    type: ExceptionFormat,
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
  @ApiOkResponse({ type: UserPresenter })
  @ApiBadRequestResponse({
    description: "Errores de validación o email ya registrado",
    type: ExceptionFormat,
  })
  @ApiNotFoundResponse({
    description: "El usuario no existe",
    type: ExceptionFormat,
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
  @ApiOkResponse({ description: "El usuario fue eliminado correctamente" })
  @ApiNotFoundResponse({
    description: "El usuario no existe",
    type: ExceptionFormat,
  })
  async deleteUser(@Param("id") id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
