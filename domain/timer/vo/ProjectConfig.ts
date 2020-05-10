import { Icon } from "~/domain/common/Icon";
import { ProjectId } from "~/domain/timer/vo/ProjectId";
import { ProjectId as TaskProjectId } from "~/domain/task/vo/ProjectId";
import { ValueObject } from "owlelia";

interface Props {
  [projectId: string]: {
    icon?: Icon;
    taskProjectIds: TaskProjectId[];
  };
}

type Args = Props;

export class ProjectConfig extends ValueObject<Props> {
  private _voTaskProjectConfigBrand!: never;

  static of(args: Args): ProjectConfig {
    return new ProjectConfig(args);
  }

  static empty(): ProjectConfig {
    return new ProjectConfig({});
  }

  get value(): Props {
    return this._value;
  }

  getIcon(projectId: ProjectId): Icon | undefined {
    return this._value?.[projectId.value]?.icon;
  }

  getTaskProjectIds(projectId: ProjectId): TaskProjectId[] {
    return this._value?.[projectId.value]?.taskProjectIds ?? [];
  }

  cloneWith(
    projectId: ProjectId,
    icon?: Icon,
    taskProjectIds?: TaskProjectId[]
  ): ProjectConfig {
    return ProjectConfig.of({
      ...this.value,
      [projectId.value]: {
        icon,
        taskProjectIds:
          taskProjectIds ?? this.value[projectId.value].taskProjectIds,
      },
    });
  }
}
