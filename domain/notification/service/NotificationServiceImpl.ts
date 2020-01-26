import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { TogowlError } from '~/domain/common/TogowlError';
import { Url } from '~/domain/common/Url';
import { NotificationService } from '~/domain/notification/service/NotificationService';
import * as slack from '~/external/slack';

export class NotificationServiceImpl implements NotificationService {
  constructor(public incomingWebHookUrl: Url, public channel?: ChannelName, public proxy?: string) {}

  async notifyToSlack(message: string): Promise<TogowlError | null> {
    try {
      const ret = await slack.send(
        this.incomingWebHookUrl.getProxyAddedValue(this.proxy),
        message,
        'Togowl',
        ':togowl:',
        this.channel?.value,
      );
      return ret === 'ok' ? null : TogowlError.create('FAIL_INCOMING_WEB_HOOK', `Fail to notify slack! detail: ${ret}`);
    } catch (e) {
      return TogowlError.create('FAIL_INCOMING_WEB_HOOK', e.message);
    }
  }
}
