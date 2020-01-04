import { ValueObject } from '~/utils/vo';
import { DateTime } from '~/domain/common/DateTime';
import { EntryId } from '~/domain/timer/vo/EntryId';

interface Props {
  id: EntryId;
  description: string;
  start: DateTime;
  duration: number;
}

export class Entry extends ValueObject<Props> {
  static create(id: string | number, description: string, start: string, duration: number): Entry {
    return new Entry({
      id: EntryId.create(id),
      description,
      start: DateTime.create(start),
      duration,
    });
  }

  get description(): string {
    return this._value!.description;
  }

  get start(): DateTime {
    return this._value!.start;
  }

  get duration(): number | null {
    return this._value!.duration < 0 ? null : this._value!.duration;
  }
}
