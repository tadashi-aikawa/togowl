import { TogowlError } from '~/domain/common/TogowlError';
import { Entry } from '~/domain/timer/entity/Entry';

export interface NotificationService {
  start: (entry: Entry) => Promise<TogowlError | null>;
  done: (entry: Entry) => Promise<TogowlError | null>;
  pause: (entry: Entry) => Promise<TogowlError | null>;
}
