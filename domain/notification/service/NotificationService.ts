import { Entry } from "~/domain/timer/entity/Entry";
import { NotifyToSlackError } from "~/domain/notification/vo/NotifyToSlackError";

export interface NotificationService {
  start(entry: Entry): Promise<NotifyToSlackError | null>;
  done(entry: Entry): Promise<NotifyToSlackError | null>;
  pause(entry: Entry): Promise<NotifyToSlackError | null>;
  cancel(): Promise<NotifyToSlackError | null>;
}
