import { PrimitiveValueObject, ValueObject } from "~/utils/vo";
import { TogowlError } from "~/domain/common/TogowlError";

export class MailAddress extends PrimitiveValueObject<string> {
  static create(value: string): MailAddress {
    if (!this.isValid(value)) {
      throw new TogowlError({
        code: "INVALID_VALUE",
        message: "Invalid mail address!",
      });
    }

    return new MailAddress(value);
  }

  static isValid(value: string): boolean {
    return /.+@.+\..+/.test(value);
  }
}
