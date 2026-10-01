import { Test, TestingModule } from "@nestjs/testing";
import { AppConfigService } from "./app-config.service.js";

describe("AppConfigService", () => {
  const originalEnv = { ...process.env };
  const testDatabaseUrl =
    "postgresql://test:test@localhost:5432/cityra-test?schema=public";
  const testCookieSecret = "test-cookie-secret-at-least-32-characters";
  const testSessionSecret = "test-session-secret-at-least-32-characters";
  const testCsrfSecret = "test-csrf-secret-at-least-32-characters";

  beforeEach(() => {
    process.env.DATABASE_URL = testDatabaseUrl;
    process.env.COOKIE_SECRET = testCookieSecret;
    process.env.SESSION_SECRET = testSessionSecret;
    process.env.CSRF_SECRET = testCsrfSecret;
    process.env.CSRF_COOKIE_NAME = "csrf-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  async function createService(): Promise<AppConfigService> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppConfigService],
    }).compile();

    return module.get<AppConfigService>(AppConfigService);
  }

  it("should load default values when env vars are not set", async () => {
    delete process.env.APP_NAME;
    delete process.env.APP_VERSION;
    delete process.env.APP_DESCRIPTION;
    delete process.env.APP_PORT;
    delete process.env.APP_HOST;
    delete process.env.APP_PREFIX;
    delete process.env.APP_ENV;
    delete process.env.LOG_LEVEL;
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;
    delete process.env.SESSION_EXPIRES_IN_SECONDS;
    delete process.env.SESSION_COOKIE_NAME;
    delete process.env.CSRF_COOKIE_NAME;

    const service = await createService();

    expect(service.get("appName")).toBe("NestJS Application");
    expect(service.get("appVersion")).toBe("1.0.0");
    expect(service.get("appDescription")).toBe(
      "NestJS Application Description"
    );
    expect(service.get("port")).toBe(3000);
    expect(service.get("host")).toBe("localhost");
    expect(service.get("globalPrefix")).toBe("api");
    expect(service.get("env")).toBe("development");
    expect(service.get("logLevel")).toEqual(["error"]);
    expect(service.get("allowedOrigins")).toEqual(["http://localhost"]);
    expect(service.get("redisHost")).toBe("localhost");
    expect(service.get("redisPort")).toBe(6379);
    expect(service.get("redisPassword")).toBeUndefined();
    expect(service.get("databaseUrl")).toBe(testDatabaseUrl);
    expect(service.get("cookieSecret")).toBe(testCookieSecret);
    expect(service.get("sessionSecret")).toBe(testSessionSecret);
    expect(service.get("sessionExpiration")).toBe(86400);
    expect(service.get("sessionCookieName")).toBe("SESSION_ID");
    expect(service.get("csrfSecret")).toBe(testCsrfSecret);
    expect(service.get("csrfCookieName")).toBe("csrf-token");
  });

  it("should load custom values from env vars", async () => {
    process.env.APP_NAME = "Cityra API";
    process.env.APP_PORT = "4000";
    process.env.LOG_LEVEL = "warn, debug";
    process.env.ALLOWED_ORIGINS = "https://a.com, https://b.com";
    process.env.REDIS_HOST = "redis.internal";
    process.env.REDIS_PORT = "6380";
    process.env.REDIS_PASSWORD = "redis-password";
    process.env.COOKIE_SECRET = "custom-cookie-secret-at-least-32-chars";
    process.env.SESSION_SECRET = "custom-session-secret-at-least-32-chars";
    process.env.SESSION_EXPIRES_IN_SECONDS = "3600";
    process.env.SESSION_COOKIE_NAME = "cityra-session";
    process.env.CSRF_SECRET = testCsrfSecret;
    process.env.CSRF_COOKIE_NAME = "csrf-token";

    const service = await createService();

    expect(service.get("appName")).toBe("Cityra API");
    expect(service.get("port")).toBe(4000);
    expect(service.get("logLevel")).toEqual(["warn", "debug"]);
    expect(service.get("allowedOrigins")).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
    expect(service.get("redisHost")).toBe("redis.internal");
    expect(service.get("redisPort")).toBe(6380);
    expect(service.get("redisPassword")).toBe("redis-password");
    expect(service.get("cookieSecret")).toBe(
      "custom-cookie-secret-at-least-32-chars"
    );
    expect(service.get("sessionSecret")).toBe(
      "custom-session-secret-at-least-32-chars"
    );
    expect(service.get("sessionExpiration")).toBe(3600);
    expect(service.get("sessionCookieName")).toBe("cityra-session");
    expect(service.get("csrfSecret")).toBe(testCsrfSecret);
    expect(service.get("csrfCookieName")).toBe("csrf-token");
  });

  it("should treat empty strings as unset and fall back to defaults", async () => {
    process.env.APP_NAME = "";
    process.env.APP_PORT = "";

    const service = await createService();

    expect(service.get("appName")).toBe("NestJS Application");
    expect(service.get("port")).toBe(3000);
  });

  it("should throw when ALLOWED_ORIGINS is '*' in production", async () => {
    process.env.APP_ENV = "production";
    process.env.ALLOWED_ORIGINS = "*";

    await expect(createService()).rejects.toThrow("Configuración inválida");
  });

  it("should throw when security secrets are missing or too short", async () => {
    delete process.env.COOKIE_SECRET;
    process.env.SESSION_SECRET = "short";
    delete process.env.CSRF_SECRET;
    delete process.env.CSRF_COOKIE_NAME;

    await expect(createService()).rejects.toThrow("Configuración inválida");
  });

  it("should parse LOG_LEVEL as a trimmed array of levels", async () => {
    process.env.LOG_LEVEL = " error , warn ,log";

    const service = await createService();

    expect(service.get("logLevel")).toEqual(["error", "warn", "log"]);
  });

  it("should throw when LOG_LEVEL contains an invalid level", async () => {
    process.env.LOG_LEVEL = "invalid-level";

    await expect(createService()).rejects.toThrow("Configuración inválida");
  });
});
