import { Entity } from '~/utils/entity';
import { trimBracketContents } from '~/utils/string';
import { ProjectCategoryId } from '~/domain/timer/vo/ProjectCategoryId';
import { ProjectCategoryName } from '~/domain/timer/vo/ProjectCategoryName';

export class ProjectCategory implements Entity {
  constructor(public id: ProjectCategoryId, public name: ProjectCategoryName) {}

  equals(entity?: ProjectCategory): boolean {
    return this.id.equals(entity?.id);
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this.name.value);
  }
}
