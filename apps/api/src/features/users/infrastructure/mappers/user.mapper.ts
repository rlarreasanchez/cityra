import { UserRole, type User } from "@cityra/domain";

import { toLocalDate } from "@core/utils/date.util.js";
import { type User as PrismaUser } from "../../../../generated/prisma/client.js";

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      role: prismaUser.role as UserRole,
      isActive: prismaUser.isActive,
      createdAt: toLocalDate(prismaUser.createdAt),
      updatedAt: toLocalDate(prismaUser.updatedAt),
    };
  }
}
