import { Entity } from "owlelia";
import { trimBracketContents } from "~/utils/string";
import { ProjectCategoryId } from "~/domain/timer/vo/ProjectCategoryId";
import { ProjectCategoryName } from "~/domain/timer/vo/ProjectCategoryName";
import { Icon } from "~/domain/common/Icon";
import { Color } from "~/domain/common/Color";

interface Props {
  id: ProjectCategoryId;
  name: ProjectCategoryName;
  icon?: Icon;
  color?: Color;
}

type Args = Props;

export class ProjectCategory extends Entity<Props> {
  private _entityTimerProjectCategoryBrand!: never;

  static of(args: Args): ProjectCategory {
    return new ProjectCategory(args.id.unwrap(), args);
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

  get color(): Color | undefined {
    return this._props.color;
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this._props.name.unwrap());
  }

  cloneWith(partial: Partial<ProjectCategory>): ProjectCategory {
    return ProjectCategory.of({ ...this._props, ...partial });
  }
}
