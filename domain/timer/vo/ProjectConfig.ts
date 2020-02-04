import { ValueObject } from '~/utils/vo';
import { Icon } from '~/domain/common/Icon';
import { ProjectId } from '~/domain/timer/vo/ProjectId';
import { ProjectId as TaskProjectId } from '~/domain/task/vo/ProjectId';

interface Args {
  [projectId: string]: {
    icon?: Icon;
    taskProjectIds: TaskProjectId[];
  };
}

interface Meta {
  icon?: Icon;
  taskProjectIds: TaskProjectId[];
}

interface Props {
  [projectId: string]: Meta;
}

export class ProjectConfig extends ValueObject<Props> {
  static create(args: Args): ProjectConfig {
    return new ProjectConfig(args);
  }

  get value(): Props {
    return this._value!;
  }

  getIcon(projectId: ProjectId): Icon | undefined {
    return this._value?.[projectId.value]?.icon;
  }

  getTaskProjectIds(projectId: ProjectId): TaskProjectId[] {
    return this._value?.[projectId.value]?.taskProjectIds ?? [];
  }

  cloneWith(projectId: ProjectId, icon?: Icon, taskProjectIds?: TaskProjectId[]): ProjectConfig {
    return ProjectConfig.create({
      ...this.value,
      [projectId.value]: { icon, taskProjectIds: taskProjectIds ?? this.value[projectId.value].taskProjectIds },
    });
  }
}
