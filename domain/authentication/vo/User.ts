import { MailAddress } from '~/domain/authentication/vo/MailAddress';
import { UserName } from '~/domain/authentication/vo/UserName';
import { UId } from '~/domain/authentication/vo/UId';
import { ValueObject } from '~/utils/vo';

interface Props {
  uid: UId;
  name: UserName;
  mailAddress: MailAddress;
}

export class User extends ValueObject<Props> {
  static EMPTY: User = new User({} as any);

  static create(uid: UId, name: UserName, mailAddress: MailAddress): User {
    return new User({ uid, name, mailAddress });
  }

  static empty(): User {
    return User.EMPTY;
  }

  get name(): UserName {
    return this._value.name;
  }

  isNotEmpty(): boolean {
    return !this.equals(User.EMPTY);
  }
}
