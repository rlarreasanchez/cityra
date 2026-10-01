import { Global, Module } from "@nestjs/common";

import { CsrfController } from "./csrf.controller.js";
import { CsrfService } from "./csrf.service.js";

@Global()
@Module({
  providers: [CsrfService],
  controllers: [CsrfController],
  exports: [CsrfService],
})
export class CsrfModule {}
