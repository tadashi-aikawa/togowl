import { Entity } from "owlelia";
import { trimBracketContents } from "~/utils/string";
import { ProjectCategoryId } from "~/domain/timer/vo/ProjectCategoryId";
import { ProjectCategoryName } from "~/domain/timer/vo/ProjectCategoryName";
import { Icon } from "~/domain/common/Icon";

interface Props {
  id: ProjectCategoryId;
  name: ProjectCategoryName;
  icon?: Icon;
}

type Args = Props;

export class ProjectCategory extends Entity<Props> {
  private _entityTimerProjectCategoryBrand!: never;

  static of(args: Args): ProjectCategory {
    return new ProjectCategory(args.id.value, args);
  }

  get id(): ProjectCategoryId {
    return this._props.id;
  }

  get name(): ProjectCategoryName {
    return this._props.name;
  }

  get icon(): Icon | undefined {
    return this._props.icon;
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this._props.name.value);
  }

  cloneWith(icon?: Icon): ProjectCategory {
    return ProjectCategory.of({ ...this._props, icon });
  }
}
