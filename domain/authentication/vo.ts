export class MailAddress {
  private constructor(public value: string) {}

  static create(value: string): MailAddress {
    if (!this.isValid(value)) {
      throw new Error('Invalid mail address!');
    }

    return new MailAddress(value);
  }

  static isValid(value: string): boolean {
    return /.+@.+\..+/.test(value);
  }

  static empty(): MailAddress {
    return new MailAddress('');
  }

  isNotEmpty(): boolean {
    return this.value !== '';
  }
}

export class LoginPayload {
  private constructor(public mailAddress: MailAddress, public password: string) {}

  static create(mailAddress: MailAddress, password: string): LoginPayload {
    return new LoginPayload(mailAddress, password);
  }
}
