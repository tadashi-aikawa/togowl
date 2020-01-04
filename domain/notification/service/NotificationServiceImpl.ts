import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { TogowlError } from '~/domain/common/TogowlError';
import { Url } from '~/domain/common/Url';
import { NotificationService } from '~/domain/notification/service/NotificationService';
import * as slack from '~/external/slack';

export class NotificationServiceImpl implements NotificationService {
  // TODO: Create constructor (incomingWebHookUrl, proxy, channel)
  async notifyToSlack(
    incomingWebHookUrl: Url,
    message: string,
    channel?: ChannelName,
    proxy?: string,
  ): Promise<TogowlError | null> {
    try {
      const ret = await slack.send(
        incomingWebHookUrl.getProxyAddedValue(proxy),
        message,
        'Togowl',
        ':togowl:',
        channel?.value,
      );
      return ret === 'ok' ? null : TogowlError.create('FAIL_INCOMING_WEB_HOOK', `Fail to notify slack! detail: ${ret}`);
    } catch (e) {
      return TogowlError.create('FAIL_INCOMING_WEB_HOOK', e.message);
    }
  }
}
