import { PasswordService } from "@core/passwords/password.service.js";
import { EmailAlreadyExistsError } from "../domain/errors/email-already-exists.error.js";
import type { IUsersRepository } from "../domain/interfaces/users-repository.interface.js";
import { UsersService } from "./users.service.js";

describe("UsersService", () => {
  const usersRepository = {
    existsByEmail: vi.fn().mockResolvedValue(false),
    createUser: vi.fn(),
    updateUser: vi.fn(),
  } as unknown as IUsersRepository;
  const passwordService = {
    hashPassword: vi.fn(),
  } as unknown as PasswordService;
  const service = new UsersService(usersRepository, passwordService);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersRepository.existsByEmail).mockResolvedValue(false);
  });

  it("hashes the password before creating a user", async () => {
    vi.mocked(passwordService.hashPassword).mockResolvedValue(
      "hashed-password"
    );
    vi.mocked(usersRepository.createUser).mockResolvedValue({} as never);

    await service.createUser({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "plain-password",
      role: "ADMIN" as never,
    });

    expect(passwordService.hashPassword).toHaveBeenCalledWith("plain-password");
    expect(usersRepository.createUser).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@example.com",
      passwordHash: "hashed-password",
      role: "ADMIN",
    });
  });

  it("rejects creating a user when the email already exists", async () => {
    vi.mocked(usersRepository.existsByEmail).mockResolvedValue(true);

    await expect(
      service.createUser({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "plain-password",
        role: "ADMIN" as never,
      })
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

    expect(passwordService.hashPassword).not.toHaveBeenCalled();
    expect(usersRepository.createUser).not.toHaveBeenCalled();
  });

  it("hashes the password before updating a user", async () => {
    vi.mocked(passwordService.hashPassword).mockResolvedValue(
      "hashed-password"
    );
    vi.mocked(usersRepository.updateUser).mockResolvedValue({} as never);

    await service.updateUser("user-id", { password: "plain-password" });

    expect(passwordService.hashPassword).toHaveBeenCalledWith("plain-password");
    expect(usersRepository.updateUser).toHaveBeenCalledWith("user-id", {
      passwordHash: "hashed-password",
    });
  });

  it("does not hash or update the password when it is omitted", async () => {
    vi.mocked(usersRepository.updateUser).mockResolvedValue({} as never);

    await service.updateUser("user-id", { name: "Ada Lovelace" });

    expect(passwordService.hashPassword).not.toHaveBeenCalled();
    expect(usersRepository.updateUser).toHaveBeenCalledWith("user-id", {
      name: "Ada Lovelace",
    });
  });

  it("rejects updating to another user's email", async () => {
    vi.mocked(usersRepository.existsByEmail).mockResolvedValue(true);

    await expect(
      service.updateUser("current-user-id", { email: "taken@example.com" })
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

    expect(usersRepository.existsByEmail).toHaveBeenCalledWith(
      "taken@example.com",
      "current-user-id"
    );
    expect(usersRepository.updateUser).not.toHaveBeenCalled();
  });

  it("allows retaining the current user's email", async () => {
    vi.mocked(usersRepository.updateUser).mockResolvedValue({} as never);

    await service.updateUser("current-user-id", {
      email: "current@example.com",
    });

    expect(usersRepository.existsByEmail).toHaveBeenCalledWith(
      "current@example.com",
      "current-user-id"
    );
    expect(usersRepository.updateUser).toHaveBeenCalledWith("current-user-id", {
      email: "current@example.com",
    });
  });
});
