import { ValueObject } from "owlelia";
import { Icon } from "~/domain/common/Icon";
import { ProjectCategoryId } from "~/domain/timer/vo/ProjectCategoryId";
import { Color } from "~/domain/common/Color";

interface Prop {
  icon?: Icon;
  color?: Color;
}

interface Props {
  [projectCategoryId: string]: Prop;
}

type Args = Props;

export class ProjectCategoryConfig extends ValueObject<Props> {
  private _voTaskProjectCategoryConfigBrand!: never;

  static of(args: Args): ProjectCategoryConfig {
    return new ProjectCategoryConfig(args);
  }

  static empty(): ProjectCategoryConfig {
    return new ProjectCategoryConfig({});
  }

  unwrap(): Props {
    return this._value;
  }

  getIcon(projectCategoryId: ProjectCategoryId): Icon | undefined {
    return this._value?.[projectCategoryId.unwrap()]?.icon;
  }

  getColor(projectCategoryId: ProjectCategoryId): Color | undefined {
    return this._value?.[projectCategoryId.unwrap()]?.color;
  }

  cloneWith(
    projectCategoryId: ProjectCategoryId,
    prop: Prop
  ): ProjectCategoryConfig {
    return ProjectCategoryConfig.of({
      ...this.unwrap(),
      [projectCategoryId.unwrap()]: prop,
    });
  }
}
