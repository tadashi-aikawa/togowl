import { PrimitiveValueObject } from "~/utils/vo";

export class ProjectCategoryName extends PrimitiveValueObject<string> {
  static create(value: string): ProjectCategoryName {
    return new ProjectCategoryName(value);
  }
}
