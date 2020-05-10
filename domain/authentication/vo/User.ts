import { ValueObject } from "owlelia";
import { UserName } from "~/domain/authentication/vo/UserName";
import { UId } from "~/domain/authentication/vo/UId";

interface Props {
  uid: UId;
  name: UserName;
}

type Args = Props;

export class User extends ValueObject<Props> {
  private _voAuthenticationUserBrand!: never;

  static of(args: Args): User {
    return new User(args);
  }

  get name(): UserName {
    return this._value.name;
  }

  get uid(): UId {
    return this._value.uid;
  }
}
