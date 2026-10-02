import { Controller, Get } from "@nestjs/common";

import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service.js";
import { HealthPresenter } from "./health.presenter.js";

@Controller("health")
@ApiTags("Health")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ type: HealthPresenter })
  getHealthCheck(): HealthPresenter {
    return HealthPresenter.fromDomain(this.appService.getHealthCheck());
  }
}
