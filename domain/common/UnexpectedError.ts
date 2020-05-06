import { TogowlError } from "~/domain/common/TogowlError";

export class UnexpectedError extends TogowlError {
  code = "UNEXPECTED";
  name = "Unexpected error occurs.";

  static of(args: { detail: string }): UnexpectedError {
    return new UnexpectedError(args.detail);
  }
}
