import { PrimitiveValueObject } from "owlelia";

export class Color extends PrimitiveValueObject<string> {
  private _voCommonColorBrand!: never;

  static of(value: string): Color {
    return new Color(value);
  }
}
