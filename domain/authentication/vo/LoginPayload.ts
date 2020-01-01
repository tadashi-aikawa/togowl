import { ValueObject } from '~/utils/vo';
import { MailAddress } from '~/domain/authentication/vo/MailAddress';

interface Props {
  mailAddress: MailAddress;
  password: string;
}

export class LoginPayload extends ValueObject<Props> {
  static create(mailAddress: MailAddress, password: string): LoginPayload {
    return new LoginPayload({ mailAddress, password });
  }

  get mailAddress(): MailAddress {
    return this._value!.mailAddress;
  }

  get password(): string {
    return this._value!.password;
  }
}
