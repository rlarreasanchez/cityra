import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service.js";

@Controller("health")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealthCheck(): { status: string; timestamp: string; service: string } {
    return this.appService.getHealthCheck();
  }
}
