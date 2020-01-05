import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { ValueObject } from '~/utils/vo';

dayjs.locale('ja');

const pad00 = (v: number) => String(v).padStart(2, '0');
function toHHmmss(seconds: number): string {
  const hour = (seconds / (60 * 60)) | 0;
  const min = ((seconds % (60 * 60)) / 60) | 0;
  const sec = seconds % 60;
  return `${pad00(hour)}:${pad00(min)}:${pad00(sec)}`;
}

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
