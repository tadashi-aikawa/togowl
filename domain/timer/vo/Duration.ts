import { PrimitiveValueObject } from "owlelia";
import { toJapaneseFromSecond } from "~/utils/time";

export class Duration extends PrimitiveValueObject<number> {
  private _voTaskDurationBrand!: never;

  static of(value: number): Duration {
    return new Duration(value);
  }

  get asJapanese(): string {
    return toJapaneseFromSecond(this.value);
  }
}
