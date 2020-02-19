import { ValueObject } from '~/utils/vo';

interface Props {
  token?: string;
  workspaceId?: number;
  proxy?: string;
}

export class TimerConfig extends ValueObject<Props> {
  static create(token?: string, workspaceId?: number, proxy?: string): TimerConfig {
    return new TimerConfig({
      token,
      workspaceId,
      proxy,
    });
  }

  get token(): string | undefined {
    return this._value.token;
  }

  get workspaceId(): number | undefined {
    return this._value.workspaceId;
  }

  get proxy(): string | undefined {
    return this._value.proxy;
  }
}
