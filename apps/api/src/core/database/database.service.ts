import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { PrismaPg } from "@prisma/adapter-pg";

import { Pool } from "pg";

import { AppConfigService } from "@config/app-config.service.js";
import { PrismaClient } from "../../generated/prisma/client.js";

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: AppConfigService) {
    const pool = new Pool({
      connectionString: config.get("databaseUrl"),
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ["error", "warn"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Additional method to clear the database
  async clearDatabase() {
    if (this.config.get("env") === "test") {
      await this.$transaction([
        // Add all models here
        // this.user.deleteMany(), // Example
      ]);
    }
  }
}
