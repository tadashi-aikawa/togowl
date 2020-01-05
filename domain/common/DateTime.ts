import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { ValueObject } from '~/utils/vo';
import { toHHmmss } from '~/utils/time';

dayjs.locale('ja');

export class DateTime extends ValueObject<dayjs.Dayjs> {
  static create(value: string): DateTime {
    return new DateTime(dayjs(value));
  }

  static now(): DateTime {
    return new DateTime(dayjs());
  }

  get displayTime(): string {
    return this._value!.format('HH:mm:ss');
  }

  displayDiffFromNow(): string {
    return toHHmmss(dayjs().diff(this._value!, 'second'));
  }
}
