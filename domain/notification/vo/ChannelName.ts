import { Either, left, PrimitiveValueObject, right } from "owlelia";
import { TogowlError } from "~/domain/common/TogowlError";

export class InvalidChannelNameError extends TogowlError {
  code = "INVALID_CHANNEL_NAME";
  name = "Invalid channel name.";

  static of(args: { invalidValue: string }): InvalidChannelNameError {
    return new InvalidChannelNameError(
      `${args.invalidValue} is invalid channel name format. It must start with #.`
    );
  }
}

export class ChannelName extends PrimitiveValueObject<string> {
  private _voNotificationChannelNameBrand!: never;

  static try(value: string): Either<InvalidChannelNameError, ChannelName> {
    if (!/^#[^#]+/.test(value)) {
      return left(
        InvalidChannelNameError.of({
          invalidValue: value,
        })
      );
    }

    return right(new ChannelName(value));
  }
}
