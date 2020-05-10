import { ValueObject } from "owlelia";
import { MailAddress } from "~/domain/authentication/vo/MailAddress";

interface Props {
  mailAddress: MailAddress;
  password: string;
}

type Args = Props;

export class LoginPayload extends ValueObject<Props> {
  private _voAuthenticationLoginPayloadBrand!: never;

  static of(args: Args): LoginPayload {
    return new LoginPayload(args);
  }

  get mailAddress(): MailAddress {
    return this._value.mailAddress;
  }

  get password(): string {
    return this._value.password;
  }
}
