import { ValueObject } from '~/utils/vo';
import { Icon } from '~/domain/common/Icon';
import { ProjectCategoryId } from '~/domain/timer/vo/ProjectCategoryId';

interface Args {
  [projectCategoryId: string]: {
    icon?: Icon;
  };
}

interface Meta {
  icon?: Icon;
}

interface Props {
  [projectCategoryId: string]: Meta;
}

export class ProjectCategoryConfig extends ValueObject<Props> {
  static create(args: Args): ProjectCategoryConfig {
    return new ProjectCategoryConfig(args);
  }

  getIcon(projectCategoryId: ProjectCategoryId): Icon | undefined {
    return this._value?.[projectCategoryId.value]?.icon;
  }
}
