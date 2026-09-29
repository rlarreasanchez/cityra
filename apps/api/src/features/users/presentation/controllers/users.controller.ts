import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
} from "@nestjs/common";

import { UsersService } from "../../application/users.service.js";
import { CreateUserDto } from "../dtos/create-user.dto.js";
import { UpdateUserDto } from "../dtos/update-user.dto.js";
import { UsersExceptionFilter } from "../filters/users-exception.filter.js";

@Controller("users")
@UseFilters(UsersExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(":id")
  getUserById(@Param("id") id: string) {
    return this.usersService.getUserById(id);
  }

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });
  }

  @Patch(":id")
  updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, {
      name: dto.name,
      email: dto.email,
      role: dto.role,
      isActive: dto.isActive,
      password: dto.password,
    });
  }

  @Delete(":id")
  deleteUser(@Param("id") id: string) {
    return this.usersService.deleteUser(id);
  }
}
