import { Entity } from "owlelia";
import { ProjectId } from "~/domain/timer/vo/ProjectId";
import { ProjectName } from "~/domain/timer/vo/ProjectlName";
import { trimBracketContents } from "~/utils/string";
import { ProjectCategory } from "~/domain/timer/entity/ProjectCategory";
import { Icon } from "~/domain/common/Icon";
import { ProjectId as TaskProjectId } from "~/domain/task/vo/ProjectId";

interface Props {
  id: ProjectId;
  name: ProjectName;
  icon?: Icon;
  category?: ProjectCategory;
  taskProjectIds?: TaskProjectId[];
}

type Args = Props;

export class Project extends Entity<Props> {
  private _entityTimerProjectBrand!: never;

  static of(args: Args): Project {
    return new Project(args.id.value, args);
  }

  get id(): ProjectId {
    return this._props.id;
  }

  get name(): ProjectName {
    return this._props.name;
  }

  get icon(): Icon | undefined {
    return this._props.icon;
  }

  get category(): ProjectCategory | undefined {
    return this._props.category;
  }

  get taskProjectIds(): TaskProjectId[] {
    return this._props.taskProjectIds ?? [];
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this._props.name.value);
  }

  cloneWith(
    icon?: Icon,
    category?: ProjectCategory,
    taskProjectIds?: TaskProjectId[]
  ): Project {
    return Project.of({ ...this._props, icon, category, taskProjectIds });
  }
}
