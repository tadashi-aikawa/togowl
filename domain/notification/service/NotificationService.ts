import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { TogowlError } from '~/domain/common/TogowlError';
import { Url } from '~/domain/common/Url';

export interface NotificationService {
  notifyToSlack: (message: string) => Promise<TogowlError | null>;
}
