import { UserName } from "~/domain/authentication/vo/UserName";
import { UId } from "~/domain/authentication/vo/UId";
import { ValueObject } from "~/utils/vo";

interface Props {
  uid: UId;
  name: UserName;
}

export class User extends ValueObject<Props> {
  static create(uid: UId, name: UserName): User {
    return new User({ uid, name });
  }

  get name(): UserName {
    return this._value.name;
  }

  get uid(): UId {
    return this._value.uid;
  }
}
