import { ValueObject } from '~/utils/vo';

interface Props {
  token?: string;
  syncToken?: string;
}

export class TaskConfig extends ValueObject<Props> {
  static create(token?: string, syncToken?: string): TaskConfig {
    return new TaskConfig({
      token,
      syncToken,
    });
  }

  get token(): string | undefined {
    return this._value!.token;
  }

  get syncToken(): string | undefined {
    return this._value!.syncToken;
  }
}
