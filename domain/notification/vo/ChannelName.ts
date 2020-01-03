import { PrimitiveValueObject } from '~/utils/vo';
import { TogowlError } from '~/domain/common/TogowlError';

export class ChannelName extends PrimitiveValueObject<string> {
  static create(value: string): ChannelName {
    if (!this.isValid(value)) {
      throw new TogowlError({ code: 'INVALID_VALUE', message: 'Invalid channel name. It must start with #.' });
    }
    return new ChannelName(value);
  }

  static isValid(value: string): boolean {
    return /^#[^#]+/.test(value);
  }
}
