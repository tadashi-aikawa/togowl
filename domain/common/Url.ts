import { Either, left, PrimitiveValueObject, right } from "owlelia";
import { TogowlError } from "~/domain/common/TogowlError";

export class InvalidUrlError extends TogowlError {
  code = "INVALID_URL";
  name = "Invalid URL.";

  static of(args: { invalidValue: string }): InvalidUrlError {
    return new InvalidUrlError(`${args.invalidValue} is invalid URL format.`);
  }
}

export class Url extends PrimitiveValueObject<string> {
  private _voCommonUrlBrand!: never;

  static try(value: string): Either<InvalidUrlError, Url> {
    if (!/^[^:]+:\/\/.+/.test(value)) {
      return left(
        InvalidUrlError.of({
          invalidValue: value,
        })
      );
    }

    return right(new Url(value));
  }

  getProxyAddedValue(proxy?: string): string {
    return proxy ? this._value.replace("://", `://${proxy}/`) : this._value!;
  }
}
