import { PrimitiveValueObject } from '~/utils/vo';
import { TogowlError } from '~/domain/common/TogowlError';

export class Url extends PrimitiveValueObject<string> {
  static create(value: string): Url {
    if (!this.isValid(value)) {
      throw new TogowlError({ code: 'INVALID_VALUE', message: 'Invalid URL!' });
    }

    return new Url(value);
  }

  static isValid(value: string): boolean {
    return /^https?:\/\/.+/.test(value);
  }
}
