import { PrimitiveValueObject } from '~/utils/vo';

export class UserName extends PrimitiveValueObject<string> {
  static create(value: string): UserName {
    return new UserName(value);
  }
}
