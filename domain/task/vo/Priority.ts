import { TogowlError } from '~/domain/common/TogowlError';

export class Priority {
  private static readonly _values: Priority[] = [];

  static readonly NORMAL = new Priority(1, 'normal');
  static readonly HIGH = new Priority(2, 'high');
  static readonly HIGHER = new Priority(3, 'higher');
  static readonly HIGHEST = new Priority(4, 'highest');

  private constructor(readonly value: number, readonly name: string) {
    Priority._values.push(this);
  }

  static create(value: number): Priority {
    const p = Priority._values.find(x => x.value === value);
    if (!p) {
      throw TogowlError.create('INVALID_VALUE', 'Invalid priority. It must 1 - 4.');
    }
    return p;
  }
}
