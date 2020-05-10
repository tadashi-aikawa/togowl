import { BaseError } from "owlelia";

export abstract class TogowlError extends BaseError {
  get messageForLog(): string {
    return `[${this.code}]: ${this.name}
    ---
    ${this.message}`;
  }
}
