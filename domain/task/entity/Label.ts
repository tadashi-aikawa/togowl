import { Entity } from "owlelia";
import { LabelId } from "../vo/LabelId";

interface Props {
  id: LabelId;
  name: string;
}

type Args = Props;

export class Label extends Entity<Props> {
  private _entityTaskLabelBrand!: never;

  static of(args: Args): Label {
    return new Label(args.id.unwrap(), args);
  }

  get id(): LabelId {
    return this._props.id;
  }

  get idAsNumber(): number {
    return this._props.id.asNumber;
  }

  get name(): string {
    return this._props.name;
  }
}
