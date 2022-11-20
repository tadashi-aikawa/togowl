import { PrimitiveValueObject } from "owlelia";

export class TaskId extends PrimitiveValueObject<string> {
  private _voTaskTaskIdBrand!: never;

  static of(value: string | number): TaskId {
    return new TaskId(String(value));
  }
}
