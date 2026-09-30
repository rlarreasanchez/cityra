import { Global, Module } from "@nestjs/common";

import { AppConfigModule } from "@core/config/app-config.module.js";
import { DatabaseModule } from "@core/database/database.module.js";
import { PasswordsModule } from "@core/passwords/passwords.module.js";
import { AuthService } from "./application/auth.service.js";
import { AUTH_REPOSITORY_TOKEN } from "./domain/config/tokens.js";
import { PrismaAuthRepository } from "./infrastructure/prisma-auth.repository.js";
import { AuthController } from "./presentation/controllers/auth.controller.js";

@Global()
@Module({
  imports: [AppConfigModule, DatabaseModule, PasswordsModule],
  providers: [
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: PrismaAuthRepository,
    },
    AuthService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
