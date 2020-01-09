import { ValueObject } from '~/utils/vo';
import { DateTime } from '~/domain/common/DateTime';
import { EntryId } from '~/domain/timer/vo/EntryId';
import { Duration } from '~/domain/timer/vo/Duration';
import { Project } from '~/domain/timer/entity/Project';

interface Props {
  id: EntryId;
  description: string;
  start: DateTime;
  duration: Duration;
  project?: Project;
}

export class Entry extends ValueObject<Props> {
  static create(id: string | number, description: string, start: string, duration: number, project?: Project): Entry {
    return new Entry({
      id: EntryId.create(id),
      description,
      start: DateTime.create(start),
      duration: Duration.create(duration),
      project,
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

  get duration(): Duration {
    return this._value!.duration;
  }

  get project(): Project | undefined {
    return this._value!.project;
  }
}
