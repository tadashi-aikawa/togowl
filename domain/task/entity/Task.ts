import { Entity } from "owlelia";
import { TaskId } from "~/domain/task/vo/TaskId";
import { ProjectId } from "~/domain/task/vo/ProjectId";
import { Project } from "~/domain/timer/entity/Project";
import { Priority } from "~/domain/task/vo/Priority";
import { toHTML, trimBracketContents } from "~/utils/string";
import { DateTime } from "~/domain/common/DateTime";
import { Note } from "~/domain/task/entity/Note";
import { HtmlString } from "~/domain/common/HtmlString";

interface Props {
  id: TaskId;
  title: string;
  dayOrder: number;
  priority: Priority;
  projectId?: ProjectId;
  entryProject?: Project;
  dueDate?: DateTime;
  notes?: Note[];
}

type Args = Props;

// FIXME: assign entryProject
export class Task extends Entity<Props> {
  private _entityTaskTaskBrand!: never;

  static of(args: Args): Task {
    return new Task(args.id.unwrap(), args);
  }

  get id(): TaskId {
    return this._props.id;
  }

  get title(): string {
    return this._props.title;
  }

  get dayOrder(): number {
    return this._props.dayOrder;
  }

  get priority(): Priority {
    return this._props.priority;
  }

  get projectId(): ProjectId | undefined {
    return this._props.projectId;
  }

  get entryProject(): Project | undefined {
    return this._props.entryProject;
  }

  get dueDate(): DateTime | undefined {
    return this._props.dueDate;
  }

  get notes(): Note[] {
    return this._props.notes ?? [];
  }

  get titleAsMarkdown(): HtmlString {
    return toHTML(this._props.title, true);
  }

  get titleWithoutDecorated(): string {
    return trimBracketContents(this._props.title);
  }

  get titleAsMarkdownWithoutDecorated(): HtmlString {
    return toHTML(trimBracketContents(this._props.title));
  }

  cloneWith(entryProject?: Project): Task {
    return Task.of({ ...this._props, entryProject });
  }

  cloneWithDayOrder(dayOrder: number): Task {
    return Task.of({ ...this._props, dayOrder });
  }

  cloneWithDueDate(dueDate: DateTime): Task {
    return Task.of({ ...this._props, dueDate });
  }
}
