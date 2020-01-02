import { ValueObject } from '~/utils/vo';

interface Props {
  code: string;
  message: string;
}

export class TogowlError extends ValueObject<Props> {
  static create(code: string, message: string): TogowlError {
    return new TogowlError({ code, message });
  }

  get message(): string {
    return this._value!.message;
  }
}
