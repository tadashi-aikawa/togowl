import { PrimitiveValueObject } from "owlelia";

export class ProjectCategoryId extends PrimitiveValueObject<string> {
  private _voTaskProjectCategoryIdBrand!: never;

  static of(value: number): ProjectCategoryId {
    return new ProjectCategoryId(String(value));
  }

  get asNumber(): number {
    return Number(this.unwrap());
  }
}
