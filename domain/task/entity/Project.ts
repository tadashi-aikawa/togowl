import { Entity } from '~/utils/entity';
import { trimBracketContents } from '~/utils/string';
import { ProjectId } from '~/domain/task/vo/ProjectId';
import { ProjectName } from '~/domain/task/vo/ProjectlName';

export class Project implements Entity {
  constructor(public id: ProjectId, public name: ProjectName) {}

  equals(entity?: Project): boolean {
    return this.id.equals(entity?.id);
  }

  get hash(): string {
    return `${this.id.value}${this.name.value}`;
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this.name.value);
  }
}
