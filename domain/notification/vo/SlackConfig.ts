import { ValueObject } from "owlelia";
import { ChannelName } from "~/domain/notification/vo/ChannelName";
import { Url } from "~/domain/common/Url";

interface Props {
  incomingWebHookUrl?: Url;
  notifyTo?: ChannelName;
  proxy?: string;
}

type Args = Props;

export class SlackConfig extends ValueObject<Props> {
  private _voNotificationSlackConfigBrand!: never;

  static of(args: Args): SlackConfig {
    return new SlackConfig(args);
  }

  get incomingWebHookUrl(): Url | undefined {
    return this._value.incomingWebHookUrl;
  }

  get notifyTo(): ChannelName | undefined {
    return this._value.notifyTo;
  }

  get proxy(): string | undefined {
    return this._value.proxy;
  }
}
