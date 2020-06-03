import { Either, left, right } from "owlelia";
import { TogowlError } from "~/domain/common/TogowlError";

export class InvalidPriorityError extends TogowlError {
  code = "INVALID_PRIORITY";
  name = "Invalid priority.";

  static of(args: { invalidValue: number }): InvalidPriorityError {
    return new InvalidPriorityError(
      `${args.invalidValue} is invalid as a priority. It must be 1 - 4.`
    );
  }
}

export class Priority {
  private static readonly _values: Priority[] = [];

  static readonly NORMAL = new Priority(1, "normal");
  static readonly HIGH = new Priority(2, "high");
  static readonly HIGHER = new Priority(3, "higher");
  static readonly HIGHEST = new Priority(4, "highest");

  private constructor(readonly number: number, readonly name: string) {
    Priority._values.push(this);
  }

  static try(value: number): Either<InvalidPriorityError, Priority> {
    const p = Priority._values.find((x) => x.number === value);
    if (!p) {
      return left(InvalidPriorityError.of({ invalidValue: value }));
    }

    return right(p);
  }
}
