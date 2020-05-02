import { PrimitiveValueObject } from "~/utils/vo";

export class ProjectCategoryId extends PrimitiveValueObject<string> {
  static create(value: number): ProjectCategoryId {
    return new ProjectCategoryId(String(value));
  }

  get asNumber(): number {
    return Number(this.value);
  }
}
