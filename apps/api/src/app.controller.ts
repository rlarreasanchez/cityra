import { Controller, Get } from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service.js";

@Controller("health")
@ApiTags("Health")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealthCheck(): { status: string; timestamp: string; service: string } {
    return this.appService.getHealthCheck();
  }
}
