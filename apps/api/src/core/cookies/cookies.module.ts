import { Global, Module } from "@nestjs/common";

import { CookiesService } from "./cookies.service.js";

@Global()
@Module({
  providers: [CookiesService],
})
export class CookiesModule {}
