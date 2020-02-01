import { DateTime } from '~/domain/common/DateTime';
import { EntryId } from '~/domain/timer/vo/EntryId';
import { Duration } from '~/domain/timer/vo/Duration';
import { Project } from '~/domain/timer/entity/Project';
import { ProjectCategory } from '~/domain/timer/entity/ProjectCategory';
import { Entity } from '~/utils/entity';
import { ProjectId } from '~/domain/timer/vo/ProjectId';

interface Args {
  id: string | number;
  description: string;
  start: string;
  stop?: string | null;
  duration: number;
  project?: Project;
  _projectId?: ProjectId;
}

export class Entry implements Entity {
  private constructor(
    public id: EntryId,
    public description: string,
    public start: DateTime,
    public duration: Duration,
    public stop?: DateTime,
    public project?: Project,
    public _projectId?: ProjectId,
  ) {}

  equals(entry?: Entry): boolean {
    return this.id.equals(entry?.id);
  }

  get hashAsTask(): string {
    return `${this.description}${this.project?.id.value}${this.projectCategory?.id.value}`;
  }

  static create(args: Args): Entry {
    return new Entry(
      EntryId.create(args.id),
      args.description,
      DateTime.create(args.start),
      Duration.create(args.duration),
      args.stop ? DateTime.create(args.stop) : undefined,
      args.project,
      args._projectId,
    );
  }

  get projectCategory(): ProjectCategory | undefined {
    return this.project?.category;
  }

  cloneWithProject(project?: Project): Entry {
    return new Entry(this.id, this.description, this.start, this.duration, this.stop, project);
  }
}

export type PartialEntry = Partial<Omit<Entry, 'id'>>;
