import { ValueObject } from "owlelia";

interface Props {
  token?: string;
  workspaceId?: number;
  proxy?: string;
}

type Args = Props;

export class TimerConfig extends ValueObject<Props> {
  private _voTaskTimerConfigBrand!: never;

  static of(args: Args): TimerConfig {
    return new TimerConfig(args);
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
