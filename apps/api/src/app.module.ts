import { Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

import { AppConfigModule } from "@config/app-config.module.js";
import { CookiesModule } from "@core/cookies/cookies.module.js";
import { CsrfModule } from "@core/csrf/csrf.module.js";
import { DatabaseModule } from "@core/database/database.module.js";
import { LoggerModule } from "@core/logger/logger.module.js";
import { SessionModule } from "@core/session/session.module.js";
import { AuthModule } from "@features/auth/auth.module.js";
import { UsersModule } from "@features/users/users.module.js";

@Module({
  imports: [
    // Core Modules
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    SessionModule,
    CookiesModule,
    CsrfModule,

    // Feature Modules
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
