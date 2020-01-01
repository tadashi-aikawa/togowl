import { ValueObject } from '~/utils/vo';

interface Props {
  code: string;
  message: string;
}

export class TogowlError extends ValueObject<Props> {
  static EMPTY: TogowlError = new TogowlError({} as Props);

  static create(code: string, message: string): TogowlError {
    return new TogowlError({ code, message });
  }

  static empty(): TogowlError {
    return TogowlError.EMPTY;
  }

  get message(): string {
    return this._value.message;
  }

  isEmpty(): boolean {
    return this.equals(TogowlError.empty());
  }
}
