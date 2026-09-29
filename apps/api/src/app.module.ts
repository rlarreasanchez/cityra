import { Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

import { AppConfigModule } from "@config/app-config.module.js";
import { DatabaseModule } from "./core/database/database.module.js";
import { UsersModule } from "./features/users/users.module.js";

@Module({
  imports: [AppConfigModule, DatabaseModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
