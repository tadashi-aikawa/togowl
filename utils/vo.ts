import { shallowEqual } from '~/utils/compare';

interface ValueObjectProps {
  [index: string]: any;
}

export abstract class AbstractValueObject<T> {
  protected readonly _value: T | undefined;

  protected constructor(_value?: T) {
    this._value = Object.freeze(_value);
  }

  equals(vo?: AbstractValueObject<T>): boolean {
    if (vo == null || vo._value == null) {
      return false;
    }
    return shallowEqual(this._value, vo._value);
  }

  isEmpty(): boolean {
    return this._value === undefined;
  }

  isNotEmpty(): boolean {
    return !this.isEmpty();
  }
}

export abstract class ValueObject<T extends ValueObjectProps> extends AbstractValueObject<T> {}

export abstract class PrimitiveValueObject<T> extends ValueObject<T> {
  get value(): T {
    return this._value!;
  }
}
