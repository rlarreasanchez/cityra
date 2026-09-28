import { AppConfigModule } from "@config/app-config.module.js";
import { AppConfigService } from "@config/app-config.service.js";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

describe("AppConfigModule (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should expose AppConfigService globally without re-importing the module", () => {
    const service = app.get(AppConfigService);

    expect(service).toBeInstanceOf(AppConfigService);
    expect(service.get("globalPrefix")).toBe("api");
  });
});
