import { Inject, Injectable } from "@nestjs/common";

import { User } from "@cityra/domain";
import { PasswordService } from "@core/passwords/password.service.js";

import { AUTH_REPOSITORY_TOKEN } from "../domain/config/tokens.js";
import { InvalidCredentialsError } from "../domain/errors/invalid-credentials.error.js";
import { SessionUserNotFoundError } from "../domain/errors/session-user-not-found.error.js";
import { UserInactiveError } from "../domain/errors/user-inactive.error.js";
import { type IAuthRepository } from "../domain/interfaces/auth-repository.interface.js";

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: PasswordService
  ) {}

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordService.comparePasswords(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Se valida después de la contraseña para no revelar el estado de la cuenta a un atacante (CWE-203)
    if (!user.isActive) {
      throw new UserInactiveError();
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
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new SessionUserNotFoundError();
    }

    return user;
  }
}
