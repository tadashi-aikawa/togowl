import { ValueObject } from "owlelia";
import { Icon } from "~/domain/common/Icon";
import { ProjectId } from "~/domain/timer/vo/ProjectId";
import { ProjectId as TaskProjectId } from "~/domain/task/vo/ProjectId";

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

  unwrap(): Props {
    return this._value;
  }

  getIcon(projectId: ProjectId): Icon | undefined {
    return this._value?.[projectId.unwrap()]?.icon;
  }

  getTaskProjectIds(projectId: ProjectId): TaskProjectId[] {
    return this._value?.[projectId.unwrap()]?.taskProjectIds ?? [];
  }

  cloneWith(
    projectId: ProjectId,
    icon?: Icon,
    taskProjectIds?: TaskProjectId[]
  ): ProjectConfig {
    return ProjectConfig.of({
      ...this.unwrap(),
      [projectId.unwrap()]: {
        icon,
        taskProjectIds:
          taskProjectIds ?? this.unwrap()[projectId.unwrap()].taskProjectIds,
      },
    });
  }
}
