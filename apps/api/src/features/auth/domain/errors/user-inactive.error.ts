export class UserInactiveError extends Error {
  constructor() {
    super();
    this.name = "UserInactiveError";
  }
}
