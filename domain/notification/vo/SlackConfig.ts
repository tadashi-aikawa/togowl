import { ValueObject } from '~/utils/vo';
import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { Url } from '~/domain/common/Url';

interface Props {
  incomingWebHookUrl?: Url;
  notifyTo?: ChannelName;
}

export class SlackConfig extends ValueObject<Props> {
  static create(incomingWebHookUrl?: string, notifyTo?: string): SlackConfig {
    return new SlackConfig({
      incomingWebHookUrl: incomingWebHookUrl ? Url.create(incomingWebHookUrl) : undefined,
      notifyTo: notifyTo ? ChannelName.create(notifyTo) : undefined,
    });
  }

  get incomingWebHookUrl(): Url | undefined {
    return this._value!.incomingWebHookUrl;
  }

  get notifyTo(): ChannelName | undefined {
    return this._value!.notifyTo;
  }
}
