import { Injectable } from "@nestjs/common";

import type { User } from "@cityra/domain";

import { DatabaseService } from "@core/database/database.service.js";
import type {
  AuthenticatedUser,
  IAuthRepository,
} from "../domain/interfaces/auth-repository.interface.js";

import { AuthUserMapper } from "./mappers/auth-user.mapper.js";

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly database: DatabaseService) {}

  async findUserByEmail(email: string): Promise<AuthenticatedUser | null> {
    const user = await this.database.user.findUnique({
      where: { email },
    });

    return user ? AuthUserMapper.toAuthenticatedUser(user) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.database.user.findUnique({
      where: { id },
    });

    return user ? AuthUserMapper.toDomain(user) : null;
  }
}
