import { ValueObject } from "owlelia";
import { Icon } from "~/domain/common/Icon";
import { ProjectCategoryId } from "~/domain/timer/vo/ProjectCategoryId";

interface Props {
  [projectCategoryId: string]: {
    icon?: Icon;
  };
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

  get value(): Props {
    return this._value;
  }

  getIcon(projectCategoryId: ProjectCategoryId): Icon | undefined {
    return this._value?.[projectCategoryId.value]?.icon;
  }

  cloneWith(
    projectCategoryId: ProjectCategoryId,
    icon?: Icon
  ): ProjectCategoryConfig {
    return ProjectCategoryConfig.of({
      ...this.value,
      [projectCategoryId.value]: { icon },
    });
  }
}
