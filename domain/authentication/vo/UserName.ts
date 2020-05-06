import { PrimitiveValueObject } from "owlelia";

export class UserName extends PrimitiveValueObject<string> {
  private _voAuthenticationUserNameBrand!: never;

  static of(value: string): UserName {
    return new UserName(value);
  }
}
