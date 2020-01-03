import { ValueObject } from '~/utils/vo';

interface Props {
  code: string;
  message: string;
  detail?: string;
}

export class TogowlError extends ValueObject<Props> {
  static create(code: string, message: string, detail?: string): TogowlError {
    return new TogowlError({ code, message, detail });
  }

  get code(): string {
    return this._value!.code;
  }

  get message(): string {
    return this._value!.message;
  }

  get detail(): string | undefined {
    return this._value!.detail;
  }

  get messageForLog(): string {
    return `[${this.code}]: ${this.message}
    ---
    ${this.detail}`;
  }
}
