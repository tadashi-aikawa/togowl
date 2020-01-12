import { PrimitiveValueObject } from '~/utils/vo';

export class ProjectId extends PrimitiveValueObject<string> {
  static create(value: number): ProjectId {
    return new ProjectId(String(value));
  }

  get asNumber(): number {
    return Number(this.value);
  }
}