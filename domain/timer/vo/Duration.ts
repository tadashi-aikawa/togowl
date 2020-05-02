import { PrimitiveValueObject } from "~/utils/vo";
import { toJapanese, toJapaneseFromSecond } from "~/utils/time";

export class Duration extends PrimitiveValueObject<number> {
  static create(value: number): Duration {
    return new Duration(value);
  }

  get asJapanese(): string {
    return toJapaneseFromSecond(this.value);
  }
}
