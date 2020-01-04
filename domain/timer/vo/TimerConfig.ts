import { ValueObject } from '~/utils/vo';

interface Props {
  token?: string;
}

export class TimerConfig extends ValueObject<Props> {
  static create(token?: string): TimerConfig {
    return new TimerConfig({
      token,
    });
  }

  get token(): string | undefined {
    return this._value!.token;
  }
}
