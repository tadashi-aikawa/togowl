import { ValueObject } from "owlelia";
import { Theme } from "./Theme";

interface Props {
  theme: Theme;
}

type Args = Props;

export class AppConfig extends ValueObject<Props> {
  private _voAppAppConfigBrand!: never;

  static of(args: Args): AppConfig {
    return new AppConfig(args);
  }

  static empty(): AppConfig {
    return new AppConfig({ theme: Theme.empty() });
  }

  get theme(): Theme {
    return this._value.theme;
  }

  cloneWith(partial: Partial<AppConfig>): AppConfig {
    return AppConfig.of({ ...this._value, ...partial });
  }
}
