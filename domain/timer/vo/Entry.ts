import { ValueObject } from '~/utils/vo';
import { DateTime } from '~/domain/common/DateTime';
import { EntryId } from '~/domain/timer/vo/EntryId';
import { Duration } from '~/domain/timer/vo/Duration';
import { Project } from '~/domain/timer/entity/Project';
import { ProjectCategory } from '~/domain/timer/entity/ProjectCategory';

interface Props {
  id: EntryId;
  description: string;
  start: DateTime;
  stop?: DateTime;
  duration: Duration;
  project?: Project;
}

interface Args {
  id: string | number;
  description: string;
  start: string;
  stop?: string | null;
  duration: number;
  project?: Project;
}

export class Entry extends ValueObject<Props> {
  static create(args: Args): Entry {
    return new Entry({
      id: EntryId.create(args.id),
      description: args.description,
      start: DateTime.create(args.start),
      stop: args.stop ? DateTime.create(args.stop) : undefined,
      duration: Duration.create(args.duration),
      project: args.project,
    });
  }

  get id(): EntryId {
    return this._value!.id;
  }

  get description(): string {
    return this._value!.description;
  }

  get start(): DateTime {
    return this._value!.start;
  }

  get stop(): DateTime | undefined {
    return this._value!.stop;
  }

  get duration(): Duration {
    return this._value!.duration;
  }

  get project(): Project | undefined {
    return this._value!.project;
  }

  get projectCategory(): ProjectCategory | undefined {
    return this._value!.project?.category;
  }
}
