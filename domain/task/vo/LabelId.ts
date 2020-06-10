import { PrimitiveValueObject } from "owlelia";

export class LabelId extends PrimitiveValueObject<string> {
  private _voTaskNoteIdBrand!: never;

  static of(value: string | number): LabelId {
    return new LabelId(String(value));
  }

  get asNumber(): number {
    return Number(this.unwrap());
  }
}
