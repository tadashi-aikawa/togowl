import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { TogowlError } from '~/domain/common/TogowlError';
import { Url } from '~/domain/common/Url';
import { NotificationService } from '~/domain/notification/service/NotificationService';
import * as slack from '~/external/slack';
import { Entry } from '~/domain/timer/entity/Entry';

export class NotificationServiceImpl implements NotificationService {
  constructor(public incomingWebHookUrl: Url, public channel?: ChannelName, public proxy?: string) {}

  private async notifyToSlack(message: string): Promise<TogowlError | null> {
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

  start(entry: Entry): Promise<TogowlError | null> {
    const project = `:card_index_dividers: \`${entry.project?.nameWithoutBracket ?? 'No Project'}\``;
    const projectCategory = entry.projectCategory
      ? `:busts_in_silhouette: \`${entry.projectCategory.nameWithoutBracket}\` > `
      : '';
    return this.notifyToSlack(`:tio2: \`開始\`  *${entry!.description}*    ${projectCategory}${project}`);
  }

  done(entry: Entry): Promise<TogowlError | null> {
    const project = `:card_index_dividers: \`${entry.project?.nameWithoutBracket ?? 'No Project'}\``;
    const projectCategory = entry.projectCategory
      ? `:busts_in_silhouette: \`${entry.projectCategory.nameWithoutBracket}\` > `
      : '';
    return this.notifyToSlack(
      `:renne: \`完了\` \`⏱${entry.duration.asJapanese}\` *${entry.description}*    ${projectCategory}${project}`,
    );
  }

  pause(entry: Entry): Promise<TogowlError | null> {
    const project = `:card_index_dividers: \`${entry.project?.nameWithoutBracket ?? 'No Project'}\``;
    const projectCategory = entry.projectCategory
      ? `:busts_in_silhouette: \`${entry.projectCategory.nameWithoutBracket}\` > `
      : '';
    return this.notifyToSlack(
      `:zzz_kirby: \`中断\` \`⏱${entry.duration.asJapanese}\` *${entry.description}*    ${projectCategory}${project}`,
    );
  }
}
