import { ValueObject } from "owlelia";
import { Url } from "~/domain/common/Url";

interface Props {
  taskBackgroundImageUrl?: Url;
}

type Args = Props;

export class Theme extends ValueObject<Props> {
  private _voAppThemeBrand!: never;

  static of(args: Args): Theme {
    return new Theme(args);
  }

  static empty(): Theme {
    return new Theme({});
  }

  get taskBackgroundImageUrl(): string | undefined {
    return this._value.taskBackgroundImageUrl?.unwrap();
  }
}
