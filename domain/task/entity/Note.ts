import { Entity } from "owlelia";
import { DateTime } from "~/domain/common/DateTime";
import { NoteId } from "~/domain/task/vo/NoteId";
import { toMarkdown } from "~/utils/string";

interface Props {
  id: NoteId;
  body: string;
  createdAt: DateTime;
}

type Args = Props;

export class Note extends Entity<Props> {
  private _entityTaskNoteBrand!: never;

  static of(args: Args): Note {
    return new Note(args.id.unwrap(), args);
  }

  get idAsNumber(): number {
    return this._props.id.asNumber;
  }

  get bodyAsMarkdown(): string {
    return toMarkdown(this._props.body);
  }
}
