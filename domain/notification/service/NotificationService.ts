import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { TogowlError } from '~/domain/common/TogowlError';
import { Url } from '~/domain/common/Url';

export interface NotificationService {
  notifyToSlack: (incomingWebHookUrl: Url, message: string, channel?: ChannelName) => Promise<TogowlError | null>;
}
