import { Global, Module } from "@nestjs/common";

import { LoggerService } from "./logger.service.js";
import { LoggerRepository } from "./repositories/logger.repository.js";
import { LOGGER_REPOSITORY_TOKEN } from "./types/tokens.js";

@Global()
@Module({
  providers: [
    LoggerService,
    {
      provide: LOGGER_REPOSITORY_TOKEN,
      useClass: LoggerRepository,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
