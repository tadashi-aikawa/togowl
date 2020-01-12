import { ProjectId } from '~/domain/timer/vo/ProjectId';
import { ProjectName } from '~/domain/timer/vo/ProjectlName';
import { Entity } from '~/utils/entity';
import { trimBracketContents } from '~/utils/string';

export class Project implements Entity {
  constructor(public id: ProjectId, public name: ProjectName) {}

  equals(entity?: Project): boolean {
    return this.id.equals(entity?.id);
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this.name.value);
  }
}
