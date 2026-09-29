import { Test, TestingModule } from "@nestjs/testing";
import { AppConfigService } from "./app-config.service.js";

describe("AppConfigService", () => {
  const originalEnv = { ...process.env };
  const testDatabaseUrl =
    "postgresql://test:test@localhost:5432/cityra-test?schema=public";

  beforeEach(() => {
    process.env.DATABASE_URL = testDatabaseUrl;
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
    delete process.env.ALLOWED_ORIGINS;

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
    expect(service.get("allowedOrigins")).toEqual(["http://localhost"]);
    expect(service.get("databaseUrl")).toBe(testDatabaseUrl);
  });

  it("should load custom values from env vars", async () => {
    process.env.APP_NAME = "Cityra API";
    process.env.APP_PORT = "4000";
    process.env.ALLOWED_ORIGINS = "https://a.com, https://b.com";

    const service = await createService();

    expect(service.get("appName")).toBe("Cityra API");
    expect(service.get("port")).toBe(4000);
    expect(service.get("allowedOrigins")).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
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
});
