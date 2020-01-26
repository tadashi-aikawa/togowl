import { ValueObject } from '~/utils/vo';
import { Icon } from '~/domain/common/Icon';
import { ProjectId } from '~/domain/timer/vo/ProjectId';

interface Args {
  [projectId: string]: {
    icon?: Icon;
  };
}

interface Meta {
  icon?: Icon;
}

interface Props {
  [projectId: string]: Meta;
}

export class ProjectConfig extends ValueObject<Props> {
  static create(args: Args): ProjectConfig {
    return new ProjectConfig(args);
  }

  getIcon(projectId: ProjectId): Icon | undefined {
    return this._value?.[projectId.value]?.icon;
  }
}
