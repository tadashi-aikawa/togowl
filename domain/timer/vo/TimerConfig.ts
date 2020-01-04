import { ValueObject } from '~/utils/vo';

interface Props {
  token?: string;
  proxy?: string;
}

export class TimerConfig extends ValueObject<Props> {
  static create(token?: string, proxy?: string): TimerConfig {
    return new TimerConfig({
      token,
      proxy,
    });
  }

  get token(): string | undefined {
    return this._value!.token;
  }

  get proxy(): string | undefined {
    return this._value!.proxy;
  }
}
