import { Global, Module } from "@nestjs/common";

import { SessionGuard } from "./guards/session.guard.js";
import { SessionService } from "./session.service.js";

@Global()
@Module({
  providers: [SessionService, SessionGuard],
  exports: [SessionService, SessionGuard],
})
export class SessionModule {}
