import { User, UserRole } from "@cityra/domain";
import { ApiProperty } from "@nestjs/swagger";

// Duplica la forma de UserPresenter (features/users) a propósito para mantener
// el feature auth autocontenido y no acoplarlo a otros features.
export class AuthenticatedUserPresenter {
  @ApiProperty({ example: "8400a5d1-5c1a-4b44-9a1a-2a9b1a0f9f3a" })
  id: string;

  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({ example: "user@example.com" })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TECHNICIAN })
  role: UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: "2026-10-01T12:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-10-01T12:00:00.000Z" })
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static fromDomain(user: User): AuthenticatedUserPresenter {
    return new AuthenticatedUserPresenter(user);
  }
}
