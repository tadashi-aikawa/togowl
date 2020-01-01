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
  static create(uid: UId, name: UserName, mailAddress: MailAddress): User {
    return new User({ uid, name, mailAddress });
  }

  static empty(): User {
    return new User();
  }

  get name(): UserName {
    return this._value!.name;
  }
}
