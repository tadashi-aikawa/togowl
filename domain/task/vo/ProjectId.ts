import { PrimitiveValueObject } from "owlelia";

export class ProjectId extends PrimitiveValueObject<string> {
  private _voTaskProjectIdBrand!: never;

  static of(value: number | string): ProjectId {
    return new ProjectId(String(value));
  }

  get asNumber(): number {
    return Number(this.value);
  }
}
