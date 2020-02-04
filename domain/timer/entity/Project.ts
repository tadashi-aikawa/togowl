import { ProjectId } from '~/domain/timer/vo/ProjectId';
import { ProjectName } from '~/domain/timer/vo/ProjectlName';
import { Entity } from '~/utils/entity';
import { trimBracketContents } from '~/utils/string';
import { ProjectCategory } from '~/domain/timer/entity/ProjectCategory';
import { Icon } from '~/domain/common/Icon';
import { ProjectId as TaskProjectId } from '~/domain/task/vo/ProjectId';

export class Project implements Entity {
  constructor(
    public id: ProjectId,
    public name: ProjectName,
    public icon?: Icon,
    public category?: ProjectCategory,
    public taskProjectIds?: TaskProjectId[],
  ) {}

  equals(entity?: Project): boolean {
    return this.id.equals(entity?.id);
  }

  get nameWithoutBracket(): string {
    return trimBracketContents(this.name.value);
  }

  cloneWith(icon?: Icon, category?: ProjectCategory, taskProjectIds?: TaskProjectId[]): Project {
    return new Project(this.id, this.name, icon, category, taskProjectIds);
  }
}
