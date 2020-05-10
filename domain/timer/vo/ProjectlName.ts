import { PrimitiveValueObject } from "owlelia";

export class ProjectName extends PrimitiveValueObject<string> {
  private _voTaskProjectNameBrand!: never;

  static of(value: string): ProjectName {
    return new ProjectName(value);
  }
}
