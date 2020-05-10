import { ValueObject } from "owlelia";

interface Props {
  token?: string;
  syncToken?: string;
}

type Args = Props;

export class TaskConfig extends ValueObject<Props> {
  private _voTaskTaskConfigBrand!: never;

  static of(args: Args): TaskConfig {
    return new TaskConfig(args);
  }

  get token(): string | undefined {
    return this._value.token;
  }

  get syncToken(): string | undefined {
    return this._value.syncToken;
  }
}
