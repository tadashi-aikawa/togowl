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
    return new Project(args.id.unwrap(), args);
  }

  get id(): ProjectId {
    return this._props.id;
  }

  get name(): ProjectName {
    return this._props.name;
  }

  get indexForSearch(): string {
    return `${this.id.unwrap()}${this.name.unwrap()}`;
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this._props.name.unwrap());
  }
}
