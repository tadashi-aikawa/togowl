import { ValueObject } from "owlelia";
import { Url } from "~/domain/common/Url";

interface Props {
  url?: Url;
  emoji?: string;
}

type Args = Props;

export class Icon extends ValueObject<Props> {
  private _voCommonIconBrand!: never;

  static of(args: Args): Icon {
    return new Icon({
      url: args.url,
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
