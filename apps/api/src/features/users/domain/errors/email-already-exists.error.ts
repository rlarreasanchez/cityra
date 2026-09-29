export class EmailAlreadyExistsError extends Error {
  constructor() {
    super();
    this.name = "EmailAlreadyExistsError";
  }
}
