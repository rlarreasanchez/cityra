import { User, UserRole } from "@cityra/domain";
import { INestApplication, VersioningType } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppConfigService } from "../src/core/config/app-config.service.js";
import { DatabaseService } from "../src/core/database/database.service.js";
import { validationPipe } from "../src/core/exceptions/pipes/validation.pipe.js";
import { PasswordService } from "../src/core/passwords/password.service.js";
import { USERS_REPOSITORY_TOKEN } from "../src/features/users/domain/config/tokens.js";
import {
  CreateUserData,
  IUsersRepository,
  UpdateUserData,
} from "../src/features/users/domain/interfaces/users-repository.interface.js";
import { UsersModule } from "../src/features/users/users.module.js";

type StoredUser = {
  user: User;
  passwordHash: string;
};

describe("UsersModule (e2e)", () => {
  let app: INestApplication;
  let records: StoredUser[];
  let passwordService: PasswordService;

  const usersRepository: IUsersRepository = {
    getUsers: async () => records.map(({ user }) => user),
    getUserById: async (id) =>
      records.find(({ user }) => user.id === id)?.user ?? null,
    existsByEmail: async (email, exceptUserId) =>
      records.some(
        ({ user }) => user.email === email && user.id !== exceptUserId
      ),
    createUser: async (data: CreateUserData) => {
      const now = new Date();
      const record: StoredUser = {
        user: {
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        },
        passwordHash: data.passwordHash,
      };
      records.push(record);
      return record.user;
    },
    updateUser: async (id: string, data: UpdateUserData) => {
      const record = records.find(({ user }) => user.id === id);
      if (!record) {
        throw new Error("User not found");
      }

      const { passwordHash, ...userData } = data;
      record.user = {
        ...record.user,
        ...userData,
        updatedAt: new Date(),
      };
      if (passwordHash !== undefined) {
        record.passwordHash = passwordHash;
      }
      return record.user;
    },
    deleteUser: async (id: string) => {
      const previousLength = records.length;
      records = records.filter(({ user }) => user.id !== id);
      return records.length < previousLength;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(USERS_REPOSITORY_TOKEN)
      .useValue(usersRepository)
      .overrideProvider(DatabaseService)
      .useValue({})
      .overrideProvider(AppConfigService)
      .useValue({ get: () => undefined })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: "1",
    });
    app.useGlobalPipes(validationPipe);
    await app.init();
    passwordService = app.get(PasswordService);
  });

  beforeEach(() => {
    records = [];
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates a user with a hashed password and returns the user without the hash", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: UserRole.ADMIN,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: UserRole.ADMIN,
      isActive: true,
    });
    expect(response.body).not.toHaveProperty("passwordHash");
    expect(response.body).not.toHaveProperty("password");
    expect(records[0].passwordHash).not.toBe("password123");
    await expect(
      passwordService.comparePasswords("password123", records[0].passwordHash)
    ).resolves.toBe(true);
  });

  it("rejects creation when password confirmation does not match", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
        confirmPassword: "different123",
        role: UserRole.ADMIN,
      })
      .expect(400);

    expect(records).toHaveLength(0);
  });

  it("returns the validation error format for invalid and duplicate emails", async () => {
    const createPayload = {
      name: "Ada Lovelace",
      password: "password123",
      confirmPassword: "password123",
      role: UserRole.ADMIN,
    };

    const invalidEmailResponse = await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({ ...createPayload, email: "invalid-email" })
      .expect(400);

    await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({ ...createPayload, email: "ada@example.com" })
      .expect(201);

    const duplicateEmailResponse = await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({ ...createPayload, email: "ada@example.com" })
      .expect(400);

    expect(duplicateEmailResponse.body).toMatchObject({
      message: invalidEmailResponse.body.message,
      error: invalidEmailResponse.body.error,
    });
    expect(Object.keys(duplicateEmailResponse.body.validationErrors)).toEqual(
      Object.keys(invalidEmailResponse.body.validationErrors)
    );
    expect(duplicateEmailResponse.body.validationErrors.email).toEqual([
      "El email ya está registrado",
    ]);
    expect(invalidEmailResponse.body.validationErrors.email).toContain(
      "El email debe ser una dirección de correo electrónico válida"
    );
  });

  it("rejects changing an email to one already used by another user", async () => {
    const firstUser = await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: UserRole.ADMIN,
      })
      .expect(201);
    const secondUser = await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({
        name: "Grace Hopper",
        email: "grace@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: UserRole.VIEWER,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/users/${secondUser.body.id}`)
      .send({ email: "ada@example.com" })
      .expect(400);

    expect(response.body).toMatchObject({
      message: "Existen errores de validación. Por favor, revise los campos.",
      validationErrors: { email: ["El email ya está registrado"] },
      error: "VALIDATION_FAILED",
    });
    expect(firstUser.body.email).toBe("ada@example.com");
    expect(records[1].user.email).toBe("grace@example.com");
  });

  it("allows updating a user without changing their email", async () => {
    const user = await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: UserRole.ADMIN,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${user.body.id}`)
      .send({ email: "ada@example.com", name: "Ada Byron" })
      .expect(200);
  });

  it("returns not found when deleting a user that does not exist", async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/v1/users/${crypto.randomUUID()}`)
      .expect(404);

    expect(response.body).toMatchObject({
      message: "El usuario no existe",
      error: "USER_NOT_FOUND",
    });
  });

  it("gets, updates and deletes a user through the HTTP endpoints", async () => {
    const createResponse = await request(app.getHttpServer())
      .post("/api/v1/users")
      .send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: UserRole.ADMIN,
      })
      .expect(201);
    const id = createResponse.body.id as string;
    const originalPasswordHash = records[0].passwordHash;

    await request(app.getHttpServer())
      .get("/api/v1/users")
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBe(id);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/users/${id}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.email).toBe("ada@example.com");
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${id}`)
      .send({ name: "Ada Byron" })
      .expect(200)
      .expect((response) => {
        expect(response.body.name).toBe("Ada Byron");
      });

    expect(records[0].passwordHash).toBe(originalPasswordHash);

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${id}`)
      .send({
        password: "new-password123",
        confirmPassword: "new-password123",
      })
      .expect(200);

    expect(records[0].passwordHash).not.toBe(originalPasswordHash);
    await expect(
      passwordService.comparePasswords(
        "new-password123",
        records[0].passwordHash
      )
    ).resolves.toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/v1/users/${id}`)
      .expect(200);
    await request(app.getHttpServer())
      .get("/api/v1/users")
      .expect(200)
      .expect((response) => expect(response.body).toHaveLength(0));
  });
});
