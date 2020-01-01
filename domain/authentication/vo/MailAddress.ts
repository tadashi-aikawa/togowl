import { PrimitiveValueObject, ValueObject } from '~/utils/vo';

export class MailAddress extends PrimitiveValueObject<string> {
  static EMPTY: MailAddress = new MailAddress('');

  static create(value: string): MailAddress {
    if (!this.isValid(value)) {
      throw new Error('Invalid mail address!');
    }

    return new MailAddress(value);
  }

  static empty(): MailAddress {
    return MailAddress.EMPTY;
  }

  static isValid(value: string): boolean {
    return /.+@.+\..+/.test(value);
  }

  isNotEmpty(): boolean {
    return !this.equals(MailAddress.EMPTY);
  }
}
