import { Entity } from "owlelia";
import { trimBracketContents } from "~/utils/string";
import { ProjectId } from "~/domain/task/vo/ProjectId";
import { ProjectName } from "~/domain/task/vo/ProjectlName";

interface Props {
  id: ProjectId;
  name: ProjectName;
}

type Args = Props;

export class Project extends Entity<Props> {
  private _entityTaskProjectBrand!: never;

  static of(args: Args): Project {
    return new Project(args.id.value, args);
  }

  get id(): ProjectId {
    return this._props.id;
  }

  get name(): ProjectName {
    return this._props.name;
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this._props.name.value);
  }
}
