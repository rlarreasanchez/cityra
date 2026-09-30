export class SessionUserNotFoundError extends Error {
  constructor() {
    super();
    this.name = "SessionUserNotFoundError";
  }
}
