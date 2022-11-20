import { Entity } from "owlelia";
import { DateTime } from "~/domain/common/DateTime";
import { NoteId } from "~/domain/task/vo/NoteId";
import { toHTML } from "~/utils/string";
import { HtmlString } from "~/domain/common/HtmlString";

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

  get bodyAsMarkdown(): HtmlString {
    return toHTML(this._props.body);
  }
}
