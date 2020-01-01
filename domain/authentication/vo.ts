export class User {
  private constructor(private _uid?: UId, private _name?: UserName, private _mailAddress?: MailAddress) {}

  static create(uid: UId, name: UserName, mailAddress: MailAddress): User {
    // プロパティ間のValidationが必要ならココ
    return new User(uid, name, mailAddress);
  }

  get name(): UserName {
    return this._name!;
  }

  get mailAddress(): MailAddress {
    return this._mailAddress!;
  }

  static empty(): User {
    return new User();
  }

  isNotEmpty(): boolean {
    return !!this._uid;
  }
}

export class MailAddress {
  private constructor(private _value: string) {}

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

  get value(): string {
    return this._value;
  }

  isNotEmpty(): boolean {
    return this._value !== '';
  }
}

export class UId {
  private constructor(private _value: string) {}

  static create(value: string): UId {
    return new UId(value);
  }

  get value(): string {
    return this._value;
  }
}

export class UserName {
  private constructor(private _value: string) {}

  static create(value: string): UserName {
    return new UserName(value);
  }

  get value(): string {
    return this._value;
  }
}

export class LoginPayload {
  private constructor(private _mailAddress?: MailAddress, private _password?: string) {}

  static create(mailAddress: MailAddress, password: string): LoginPayload {
    return new LoginPayload(mailAddress, password);
  }

  get mailAddress(): MailAddress {
    return this._mailAddress!;
  }

  get password(): string {
    return this._password!;
  }
}
