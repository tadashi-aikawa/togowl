import { ChannelName } from "~/domain/notification/vo/ChannelName";
import { TogowlError } from "~/domain/common/TogowlError";
import { Url } from "~/domain/common/Url";
import { NotificationService } from "~/domain/notification/service/NotificationService";
import * as slack from "~/external/slack";
import { Entry } from "~/domain/timer/entity/Entry";
import { ProjectCategory } from "~/domain/timer/entity/ProjectCategory";
import { Project } from "~/domain/timer/entity/Project";
import { NotifyToSlackError } from "~/domain/notification/vo/NotifyToSlackError";

export class NotificationServiceImpl implements NotificationService {
  constructor(
    public incomingWebHookUrl: Url,
    public channel?: ChannelName,
    public proxy?: string
  ) {}

  private async notifyToSlack(
    message: string
  ): Promise<NotifyToSlackError | null> {
    try {
      const ret = await slack.send(
        this.incomingWebHookUrl.getProxyAddedValue(this.proxy),
        message,
        "Togowl",
        ":togowl:",
        this.channel?.unwrap()
      );
      return ret === "ok"
        ? null
        : NotifyToSlackError.of({ channelName: this.channel });
    } catch (e) {
      return NotifyToSlackError.of({
        channelName: this.channel,
        stack: e.stack,
      });
    }
  }

  start(entry: Entry): Promise<NotifyToSlackError | null> {
    const footer = this.createFooter(entry.project, entry.projectCategory);
    return this.notifyToSlack(
      `:togowl_play: \`開始\`  *${entry!.description}*    ${footer}`
    );
  }

  done(entry: Entry): Promise<NotifyToSlackError | null> {
    const footer = this.createFooter(entry.project, entry.projectCategory);
    return this.notifyToSlack(
      `:togowl_complete: \`完了\` \`⏱${entry.duration.asJapanese}\` *${entry.description}*    ${footer}`
    );
  }

  pause(entry: Entry): Promise<NotifyToSlackError | null> {
    const footer = this.createFooter(entry.project, entry.projectCategory);
    return this.notifyToSlack(
      `:togowl_pause: \`中断\` \`⏱${entry.duration.asJapanese}\` *${entry.description}*    ${footer}`
    );
  }

  cancel(): Promise<NotifyToSlackError | null> {
    return this.notifyToSlack(`:unitychan_ng: \`やっぱナシ\``);
  }

  private createFooter(
    project?: Project,
    projectCategory?: ProjectCategory
  ): string {
    const projectEmoji = `:${project?.icon?.emoji ?? "card_index_dividers"}:`;
    const projectStr = `${projectEmoji} \`${
      project?.nameWithoutBracket ?? "No Project"
    }\``;

    const projectCategoryEmoji = `:${
      projectCategory?.icon?.emoji ?? "busts_in_silhouette"
    }:`;
    const projectCategoryStr = projectCategory
      ? `${projectCategoryEmoji} \`${projectCategory.nameWithoutBracket}\` > `
      : "";

    return `${projectCategoryStr}${projectStr}`;
  }
}
