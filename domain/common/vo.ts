export class TogowlError {
  constructor(private _code: string, private _message: string) {}

  static empty(): TogowlError {
    return new TogowlError('', '');
  }

  get message(): string | undefined {
    return this._message ? this._message : undefined;
  }

  isEmpty(): boolean {
    return this._code === '';
  }
}
