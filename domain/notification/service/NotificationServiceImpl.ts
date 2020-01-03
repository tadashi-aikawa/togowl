import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { TogowlError } from '~/domain/common/TogowlError';
import { Url } from '~/domain/common/Url';
import { NotificationService } from '~/domain/notification/service/NotificationService';
import * as slack from '~/external/slack';

export class NotificationServiceImpl implements NotificationService {
  async notifyToSlack(incomingWebHookUrl: Url, message: string, channel?: ChannelName): Promise<TogowlError | null> {
    const ret = await slack.send(incomingWebHookUrl.value, message, 'Togowl', ':togowl:', channel?.value);
    return ret === 'ok' ? null : TogowlError.create('FAIL_INCOMING_WEB_HOOK', `Fail to notify slack! detail: ${ret}`);
  }
}
