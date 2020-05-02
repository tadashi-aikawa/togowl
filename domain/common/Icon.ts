import { ValueObject } from "~/utils/vo";
import { Url } from "~/domain/common/Url";

interface Args {
  url?: string;
  emoji?: string;
}

interface Props {
  url?: Url;
  emoji?: string;
}

export class Icon extends ValueObject<Props> {
  static create(args: Args): Icon {
    return new Icon({
      url: args.url ? Url.create(args.url) : undefined,
      emoji: args.emoji || undefined,
    });
  }

  get url(): string | undefined {
    return this._value.url?.value;
  }

  get emoji(): string | undefined {
    return this._value.emoji;
  }
}
