import { Inject, Injectable } from "@nestjs/common";

import { User } from "@cityra/domain";
import { PasswordService } from "@core/passwords/password.service.js";

import { USERS_REPOSITORY_TOKEN } from "../domain/config/tokens.js";
import { EmailAlreadyExistsError } from "../domain/errors/email-already-exists.error.js";
import { UserNotFoundError } from "../domain/errors/user-not-found.error.js";
import {
  CreateUserData,
  type IUsersRepository,
  UpdateUserData,
} from "../domain/interfaces/users-repository.interface.js";

type CreateUserInput = Omit<CreateUserData, "passwordHash"> & {
  password: string;
};

type UpdateUserInput = Omit<UpdateUserData, "passwordHash"> & {
  password?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY_TOKEN)
    private readonly usersRepository: IUsersRepository,
    private readonly passwordService: PasswordService
  ) {}

  async getUsers(): Promise<User[]> {
    return this.usersRepository.getUsers();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.usersRepository.getUserById(id);
  }

  async createUser(data: CreateUserInput): Promise<User> {
    if (await this.usersRepository.existsByEmail(data.email)) {
      throw new EmailAlreadyExistsError();
    }

    const { password, ...userData } = data;

    return this.usersRepository.createUser({
      ...userData,
      passwordHash: await this.passwordService.hashPassword(password),
    });
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    if (
      data.email !== undefined &&
      (await this.usersRepository.existsByEmail(data.email, id))
    ) {
      throw new EmailAlreadyExistsError();
    }

    const { password, ...userData } = data;

    return this.usersRepository.updateUser(id, {
      ...userData,
      ...(password !== undefined && {
        passwordHash: await this.passwordService.hashPassword(password),
      }),
    });
  }

  async deleteUser(id: string): Promise<void> {
    const wasDeleted = await this.usersRepository.deleteUser(id);

    if (!wasDeleted) {
      throw new UserNotFoundError();
    }
  }
}
