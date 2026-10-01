import { AppConfigModule } from "@config/app-config.module.js";
import { AppConfigService } from "@config/app-config.service.js";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

describe("AppConfigModule (e2e)", () => {
  const originalEnv = { ...process.env };
  const testDatabaseUrl =
    "postgresql://test:test@localhost:5432/cityra-test?schema=public";
  const testCookieSecret = "test-cookie-secret-at-least-32-characters";
  const testSessionSecret = "test-session-secret-at-least-32-characters";
  const testCsrfSecret = "test-csrf-secret-at-least-32-characters";
  let app: INestApplication | undefined;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: testDatabaseUrl,
      COOKIE_SECRET: testCookieSecret,
      SESSION_SECRET: testSessionSecret,
      CSRF_SECRET: testCsrfSecret,
      CSRF_COOKIE_NAME: "csrf-token",
    };
    delete process.env.APP_NAME;
    delete process.env.APP_VERSION;
    delete process.env.APP_DESCRIPTION;
    delete process.env.APP_PORT;
    delete process.env.APP_HOST;
    delete process.env.APP_PREFIX;
    delete process.env.APP_ENV;
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;
    delete process.env.SESSION_EXPIRES_IN_SECONDS;
    delete process.env.SESSION_COOKIE_NAME;

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
    expect(service.get("redisHost")).toBe("localhost");
    expect(service.get("redisPort")).toBe(6379);
    expect(service.get("databaseUrl")).toBe(testDatabaseUrl);
    expect(service.get("cookieSecret")).toBe(testCookieSecret);
    expect(service.get("sessionSecret")).toBe(testSessionSecret);
    expect(service.get("sessionExpiration")).toBe(86400);
    expect(service.get("sessionCookieName")).toBe("SESSION_ID");
    expect(service.get("csrfSecret")).toBe(testCsrfSecret);
    expect(service.get("csrfCookieName")).toBe("csrf-token");
  });
});
