import { AppConfigModule } from "@config/app-config.module.js";
import { AppConfigService } from "@config/app-config.service.js";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

describe("AppConfigModule (e2e)", () => {
  const originalEnv = { ...process.env };
  const testDatabaseUrl =
    "postgresql://test:test@localhost:5432/cityra-test?schema=public";
  let app: INestApplication | undefined;

  beforeEach(async () => {
    process.env = { ...originalEnv, DATABASE_URL: testDatabaseUrl };
    delete process.env.APP_NAME;
    delete process.env.APP_VERSION;
    delete process.env.APP_DESCRIPTION;
    delete process.env.APP_PORT;
    delete process.env.APP_HOST;
    delete process.env.APP_PREFIX;
    delete process.env.APP_ENV;
    delete process.env.ALLOWED_ORIGINS;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    try {
      await app?.close();
    } finally {
      app = undefined;
      process.env = { ...originalEnv };
    }
  });

  it("should expose AppConfigService globally without re-importing the module", () => {
    const service = app!.get(AppConfigService);

    expect(service).toBeInstanceOf(AppConfigService);
    expect(service.get("globalPrefix")).toBe("api");
  });
});
