import { Entity } from "owlelia";

interface Props {
  name: string;
}

type Args = Props;

export class Label extends Entity<Props> {
  private _entityTaskLabelBrand!: never;

  static of(args: Args): Label {
    return new Label(args.name, args);
  }

  get name(): string {
    return this._props.name;
  }
}
