import { PasswordService } from "@core/passwords/password.service.js";
import { InvalidCredentialsError } from "../domain/errors/invalid-credentials.error.js";
import { SessionUserNotFoundError } from "../domain/errors/session-user-not-found.error.js";
import { UserInactiveError } from "../domain/errors/user-inactive.error.js";
import type { IAuthRepository } from "../domain/interfaces/auth-repository.interface.js";
import { AuthService } from "./auth.service.js";

describe("AuthService", () => {
  const authRepository = {
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
  } as unknown as IAuthRepository;
  const passwordService = {
    comparePasswords: vi.fn(),
  } as unknown as PasswordService;
  const service = new AuthService(authRepository, passwordService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the user without the password hash when credentials are valid", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      id: "user-id",
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: "ADMIN" as never,
      isActive: true,
      passwordHash: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(passwordService.comparePasswords).mockResolvedValue(true);

    const user = await service.validateCredentials(
      "ada@example.com",
      "plain-password"
    );

    expect(passwordService.comparePasswords).toHaveBeenCalledWith(
      "plain-password",
      "hashed-password"
    );
    expect(user).not.toHaveProperty("passwordHash");
    expect(user.email).toBe("ada@example.com");
  });

  it("rejects login when the email does not exist", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

    await expect(
      service.validateCredentials("missing@example.com", "plain-password")
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(passwordService.comparePasswords).not.toHaveBeenCalled();
  });

  it("rejects login when the user is inactive", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      id: "user-id",
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: "ADMIN" as never,
      isActive: false,
      passwordHash: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(passwordService.comparePasswords).mockResolvedValue(true);

    await expect(
      service.validateCredentials("ada@example.com", "plain-password")
    ).rejects.toBeInstanceOf(UserInactiveError);
  });

  it("rejects login when the password does not match", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      id: "user-id",
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: "ADMIN" as never,
      isActive: true,
      passwordHash: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(passwordService.comparePasswords).mockResolvedValue(false);

    await expect(
      service.validateCredentials("ada@example.com", "wrong-password")
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("returns the current user by id", async () => {
    vi.mocked(authRepository.findUserById).mockResolvedValue({
      id: "user-id",
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: "ADMIN" as never,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await service.getCurrentUser("user-id");

    expect(user.id).toBe("user-id");
  });

  it("rejects when the session user no longer exists", async () => {
    vi.mocked(authRepository.findUserById).mockResolvedValue(null);

    await expect(
      service.getCurrentUser("missing-user-id")
    ).rejects.toBeInstanceOf(SessionUserNotFoundError);
  });
});
