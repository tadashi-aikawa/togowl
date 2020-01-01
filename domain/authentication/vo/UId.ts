import { PrimitiveValueObject } from '~/utils/vo';

export class UId extends PrimitiveValueObject<string> {
  static create(value: string): UId {
    return new UId(value);
  }
}
