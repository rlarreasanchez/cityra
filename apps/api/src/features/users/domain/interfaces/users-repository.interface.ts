import { User } from "@cityra/domain";

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: User["role"];
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: User["role"];
  isActive?: boolean;
  passwordHash?: string;
}

export interface IUsersRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  existsByEmail(email: string, exceptUserId?: string): Promise<boolean>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(id: string, data: UpdateUserData): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}
