import { User } from "@cityra/domain";

export interface AuthenticatedUser extends User {
  passwordHash: string;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<AuthenticatedUser | null>;
  findUserById(id: string): Promise<User | null>;
}
