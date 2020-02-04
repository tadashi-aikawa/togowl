import { ValueObject } from '~/utils/vo';

interface Props {
  token?: string;
  proxy?: string;
}

export class TaskConfig extends ValueObject<Props> {
  static create(token?: string): TaskConfig {
    return new TaskConfig({
      token,
    });
  }

  get token(): string | undefined {
    return this._value!.token;
  }
}
