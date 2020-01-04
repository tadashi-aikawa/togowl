import { ValueObject } from '~/utils/vo';
import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { Url } from '~/domain/common/Url';

interface Props {
  incomingWebHookUrl?: Url;
  notifyTo?: ChannelName;
  proxy?: string;
}

export class SlackConfig extends ValueObject<Props> {
  static create(incomingWebHookUrl?: string, notifyTo?: string, proxy?: string): SlackConfig {
    return new SlackConfig({
      incomingWebHookUrl: incomingWebHookUrl ? Url.create(incomingWebHookUrl) : undefined,
      notifyTo: notifyTo ? ChannelName.create(notifyTo) : undefined,
      proxy,
    });
  }

  get incomingWebHookUrl(): Url | undefined {
    return this._value!.incomingWebHookUrl;
  }

  get notifyTo(): ChannelName | undefined {
    return this._value!.notifyTo;
  }

  get proxy(): string | undefined {
    return this._value!.proxy;
  }
}
