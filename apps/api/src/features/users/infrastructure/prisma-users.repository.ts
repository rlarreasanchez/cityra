import { Injectable } from "@nestjs/common";

import { User } from "@cityra/domain";

import { DatabaseService } from "@core/database/database.service.js";
import { EmailAlreadyExistsError } from "../domain/errors/email-already-exists.error.js";
import {
  type CreateUserData,
  type IUsersRepository,
  type UpdateUserData,
} from "../domain/interfaces/users-repository.interface.js";

import { UserMapper } from "./mappers/user.mapper.js";

@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly database: DatabaseService) {}

  async getUsers(): Promise<User[]> {
    const users = await this.database.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map(UserMapper.toDomain);
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.database.user.findUnique({
      where: {
        id,
      },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async existsByEmail(email: string, exceptUserId?: string): Promise<boolean> {
    const user = await this.database.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return user !== null && user.id !== exceptUserId;
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      const user = await this.database.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
          isActive: data.isActive ?? true,
        },
      });

      return UserMapper.toDomain(user);
    } catch (error) {
      if (isEmailUniqueViolation(error)) {
        throw new EmailAlreadyExistsError();
      }
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const user = await this.database.user.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
          isActive: data.isActive,
        },
      });

      return UserMapper.toDomain(user);
    } catch (error) {
      if (isEmailUniqueViolation(error)) {
        throw new EmailAlreadyExistsError();
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.database.user.delete({
      where: {
        id,
      },
    });
  }
}

function isEmailUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  if (
    !("meta" in error) ||
    typeof error.meta !== "object" ||
    error.meta === null
  ) {
    return false;
  }

  const target = "target" in error.meta ? error.meta.target : undefined;
  return Array.isArray(target)
    ? target.includes("email")
    : typeof target === "string" && target.includes("email");
}
