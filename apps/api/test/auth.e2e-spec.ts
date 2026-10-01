import type { UserRole } from "@cityra/domain";
import { INestApplication, VersioningType } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import session from "express-session";
import request from "supertest";
import { AppConfigService } from "../src/core/config/app-config.service.js";
import { DatabaseService } from "../src/core/database/database.service.js";
import { AllExceptionFilter } from "../src/core/exceptions/filters/exceptions.filter.js";
import { validationPipe } from "../src/core/exceptions/pipes/validation.pipe.js";
import type { LoggerService } from "../src/core/logger/logger.service.js";
import { PasswordService } from "../src/core/passwords/password.service.js";
import { AuthModule } from "../src/features/auth/auth.module.js";
import { AUTH_REPOSITORY_TOKEN } from "../src/features/auth/domain/config/tokens.js";
import type {
  AuthenticatedUser,
  IAuthRepository,
} from "../src/features/auth/domain/interfaces/auth-repository.interface.js";

describe("AuthModule (e2e)", () => {
  let app: INestApplication;
  let users: AuthenticatedUser[];
  let passwordService: PasswordService;

  const authRepository: IAuthRepository = {
    findUserByEmail: async (email) =>
      users.find((user) => user.email === email) ?? null,
    findUserById: async (id) => {
      const user = users.find((user) => user.id === id);
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AUTH_REPOSITORY_TOKEN)
      .useValue(authRepository)
      .overrideProvider(DatabaseService)
      .useValue({})
      .overrideProvider(AppConfigService)
      .useValue({
        get: (key: string) =>
          key === "sessionCookieName" ? "SESSION_ID" : undefined,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(
      session({
        secret: "e2e-tests-session-secret",
        name: "SESSION_ID",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
      })
    );
    app.setGlobalPrefix("api");
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: "1",
    });
    const loggerStub = {
      error: vi.fn(),
      warn: vi.fn(),
      log: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
    } as unknown as LoggerService;
    app.useGlobalFilters(
      new AllExceptionFilter(loggerStub, app.get(AppConfigService))
    );
    app.useGlobalPipes(validationPipe);
    await app.init();
    passwordService = app.get(PasswordService);
  });

  beforeEach(async () => {
    users = [
      {
        id: "user-1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        role: "ADMIN" as UserRole,
        isActive: true,
        passwordHash: await passwordService.hashPassword("password123"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  });

  afterAll(async () => {
    await app.close();
  });

  it("logs in with valid credentials and returns the user without the password hash", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "ada@example.com", password: "password123" })
      .expect(200);

    expect(response.body).toMatchObject({
      id: "user-1",
      email: "ada@example.com",
    });
    expect(response.body).not.toHaveProperty("passwordHash");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("rejects login with an email that does not exist", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "missing@example.com", password: "password123" })
      .expect(401);

    expect(response.body.errorToken).toBe("INVALID_CREDENTIALS");
  });

  it("rejects login with an incorrect password", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "ada@example.com", password: "wrong-password" })
      .expect(401);

    expect(response.body.errorToken).toBe("INVALID_CREDENTIALS");
  });

  it("rejects login when the user is inactive", async () => {
    users[0].isActive = false;

    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "ada@example.com", password: "password123" })
      .expect(403);

    expect(response.body.errorToken).toBe("USER_INACTIVE");
  });

  it("returns the validation error format for an invalid email", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "invalid-email", password: "password123" })
      .expect(400);

    expect(response.body.validationErrors.email).toContain(
      "El email debe ser una dirección de correo electrónico válida"
    );
  });

  it("rejects /me without an active session", async () => {
    await request(app.getHttpServer()).get("/api/v1/auth/me").expect(401);
  });

  it("returns the current user when authenticated", async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post("/api/v1/auth/login")
      .send({ email: "ada@example.com", password: "password123" })
      .expect(200);

    const response = await agent.get("/api/v1/auth/me").expect(200);

    expect(response.body).toMatchObject({
      id: "user-1",
      email: "ada@example.com",
    });
  });

  it("rejects /logout without an active session", async () => {
    await request(app.getHttpServer()).post("/api/v1/auth/logout").expect(401);
  });

  it("logs out and invalidates the session", async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post("/api/v1/auth/login")
      .send({ email: "ada@example.com", password: "password123" })
      .expect(200);

    await agent.post("/api/v1/auth/logout").expect(204);

    await agent.get("/api/v1/auth/me").expect(401);
  });
});
