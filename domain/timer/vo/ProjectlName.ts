import { PrimitiveValueObject } from "~/utils/vo";

export class ProjectName extends PrimitiveValueObject<string> {
  static create(value: string): ProjectName {
    return new ProjectName(value);
  }
}
