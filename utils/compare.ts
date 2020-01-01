import { shallowEqual as _shallowEqual } from 'shallow-equal-object';

export function shallowEqual<T>(one: T, other: T): boolean {
  return _shallowEqual(one, other);
}
