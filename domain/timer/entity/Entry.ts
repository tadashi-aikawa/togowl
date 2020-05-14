import { Entity } from "owlelia";
import { DateTime } from "~/domain/common/DateTime";
import { EntryId } from "~/domain/timer/vo/EntryId";
import { Duration } from "~/domain/timer/vo/Duration";
import { Project } from "~/domain/timer/entity/Project";
import { ProjectCategory } from "~/domain/timer/entity/ProjectCategory";
import { ProjectId } from "~/domain/timer/vo/ProjectId";

interface Props {
  id: EntryId;
  description: string;
  start: DateTime;
  duration: Duration;
  stop?: DateTime;
  project?: Project;
  _projectId?: ProjectId;
}

type Args = Props;

export class Entry extends Entity<Props> {
  private _entityTimerEntryBrand!: never;

  static of(args: Args): Entry {
    return new Entry(args.id.unwrap(), args);
  }

  get id(): EntryId {
    return this._props.id;
  }

  get hashAsTask(): string {
    return `${
      this._props.description
    }${this._props.project?.id.unwrap()}${this.projectCategory?.id.unwrap()}`;
  }

  get description(): string {
    return this._props.description;
  }

  get start(): DateTime {
    return this._props.start;
  }

  get duration(): Duration {
    return this._props.duration;
  }

  get stop(): DateTime | undefined {
    return this._props.stop;
  }

  get project(): Project | undefined {
    return this._props.project;
  }

  /** For clone With Project */
  get _projectId(): ProjectId | undefined {
    return this._props._projectId;
  }

  get projectCategory(): ProjectCategory | undefined {
    return this._props.project?.category;
  }

  cloneWithProject(project?: Project): Entry {
    return Entry.of({ ...this._props, project });
  }
}

export type PartialEntry = Partial<Omit<Entry, "id">>;
