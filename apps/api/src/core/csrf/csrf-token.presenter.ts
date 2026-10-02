import { ApiProperty } from "@nestjs/swagger";

export class CsrfTokenPresenter {
  @ApiProperty({ example: "a1b2c3d4e5f6.a1b2c3d4e5f6g7h8i9j0" })
  csrfToken: string;

  private constructor(csrfToken: string) {
    this.csrfToken = csrfToken;
  }

  static fromToken(csrfToken: string): CsrfTokenPresenter {
    return new CsrfTokenPresenter(csrfToken);
  }
}
