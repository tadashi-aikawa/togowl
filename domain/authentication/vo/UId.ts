import { PrimitiveValueObject } from "owlelia";

export class UId extends PrimitiveValueObject<string> {
  private _voAuthenticationUIdBrand!: never;

  static of(value: string): UId {
    return new UId(value);
  }
}
