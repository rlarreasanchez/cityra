import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("getHealthCheck", () => {
    it("should return status ok with service name and timestamp", () => {
      const result = appController.getHealthCheck();

      expect(result.status).toBe("ok");
      expect(result.service).toBe("cityra-api");
      expect(new Date(result.timestamp).toString()).not.toBe("Invalid Date");
    });
  });
});
