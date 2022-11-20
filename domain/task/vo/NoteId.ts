import { PrimitiveValueObject } from "owlelia";

export class NoteId extends PrimitiveValueObject<string> {
  private _voTaskNoteIdBrand!: never;

  static of(value: string | number): NoteId {
    return new NoteId(String(value));
  }
}
