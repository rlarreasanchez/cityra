import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "./app.service.js";

describe("AppService", () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  describe("getHealthCheck", () => {
    it("should return status ok with service name and timestamp", () => {
      const result = appService.getHealthCheck();

      expect(result.status).toBe("ok");
      expect(result.service).toBe("smart-city-api");
      expect(new Date(result.timestamp).toString()).not.toBe("Invalid Date");
    });
  });
});
