import { Either, left, PrimitiveValueObject, right } from "owlelia";
import { TogowlError } from "~/domain/common/TogowlError";

export class InvalidMailAddressError extends TogowlError {
  code = "INVALID_MAIL_ADDRESS";
  name = "Invalid mail address.";

  static of(args: { invalidValue: string }): InvalidMailAddressError {
    return new InvalidMailAddressError(
      `${args.invalidValue} is invalid mail address format.`
    );
  }
}

export class MailAddress extends PrimitiveValueObject<string> {
  private _voAuthenticationMailAddressBrand!: never;

  static try(value: string): Either<InvalidMailAddressError, MailAddress> {
    if (!/.+@.+\..+/.test(value)) {
      return left(
        InvalidMailAddressError.of({
          invalidValue: value,
        })
      );
    }
    return right(new MailAddress(value));
  }
}
