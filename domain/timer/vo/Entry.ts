import { ValueObject } from '~/utils/vo';
import { DateTime } from '~/domain/common/DateTime';
import { EntryId } from '~/domain/timer/vo/EntryId';
import { Duration } from '~/domain/timer/vo/Duration';

interface Props {
  id: EntryId;
  description: string;
  start: DateTime;
  duration: Duration;
}

export class Entry extends ValueObject<Props> {
  static create(id: string | number, description: string, start: string, duration: number): Entry {
    return new Entry({
      id: EntryId.create(id),
      description,
      start: DateTime.create(start),
      duration: Duration.create(duration),
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
}
