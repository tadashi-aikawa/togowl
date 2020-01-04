import { PrimitiveValueObject } from '~/utils/vo';

export class EntryId extends PrimitiveValueObject<string> {
  static create(value: string | number): EntryId {
    return new EntryId(String(value));
  }
}
