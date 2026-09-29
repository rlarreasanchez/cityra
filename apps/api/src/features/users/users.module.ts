import { Module } from "@nestjs/common";

import { AppConfigModule } from "@core/config/app-config.module.js";
import { DatabaseModule } from "@core/database/database.module.js";
import { PasswordsModule } from "@core/passwords/passwords.module.js";
import { UsersService } from "./application/users.service.js";
import { USERS_REPOSITORY_TOKEN } from "./domain/config/tokens.js";
import { PrismaUsersRepository } from "./infrastructure/prisma-users.repository.js";
import { UsersController } from "./presentation/controllers/users.controller.js";

@Module({
  imports: [AppConfigModule, DatabaseModule, PasswordsModule],
  providers: [
    {
      provide: USERS_REPOSITORY_TOKEN,
      useClass: PrismaUsersRepository,
    },
    UsersService,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
