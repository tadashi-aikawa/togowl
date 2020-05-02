import { PrimitiveValueObject } from "~/utils/vo";

export class TaskId extends PrimitiveValueObject<string> {
  static create(value: string | number): TaskId {
    return new TaskId(String(value));
  }

  get asNumber(): number {
    return Number(this.value);
  }
}
