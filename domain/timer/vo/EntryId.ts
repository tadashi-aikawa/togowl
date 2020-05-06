import { PrimitiveValueObject } from "owlelia";

export class EntryId extends PrimitiveValueObject<string> {
  private _voTaskEntryIdBrand!: never;

  static of(value: string | number): EntryId {
    return new EntryId(String(value));
  }

  get asNumber(): number {
    return Number(this.value);
  }
}
