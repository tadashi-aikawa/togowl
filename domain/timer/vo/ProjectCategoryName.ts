import { PrimitiveValueObject } from "owlelia";

export class ProjectCategoryName extends PrimitiveValueObject<string> {
  private _voTaskProjectCategoryNameBrand!: never;

  static of(value: string): ProjectCategoryName {
    return new ProjectCategoryName(value);
  }
}
