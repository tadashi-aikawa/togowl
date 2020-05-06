import { TogowlError } from "~/domain/common/TogowlError";
import { ChannelName } from "~/domain/notification/vo/ChannelName";

export class NotifyToSlackError extends TogowlError {
  code = "NOTIFY_TO_SLACK";
  name = "Fail notifying to slack.";

  static of(args: {
    channelName?: ChannelName;
    stack?: string;
  }): NotifyToSlackError {
    return new NotifyToSlackError(
      `Fail notifying to ${args.channelName?.value ?? "default channel"}.`,
      args.stack
    );
  }
}
