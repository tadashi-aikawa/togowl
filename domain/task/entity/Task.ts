import { Entity } from '~/utils/entity';
import { TaskId } from '~/domain/task/vo/TaskId';
import { ProjectId } from '~/domain/task/vo/ProjectId';
import { Project } from '~/domain/timer/entity/Project';
import { Priority } from '~/domain/task/vo/Priority';

// FIXME: assign entryProject
export class Task implements Entity {
  constructor(
    public id: TaskId,
    public title: string,
    public dayOrder: number,
    public priority: Priority,
    public projectId?: ProjectId,
    public entryProject?: Project,
  ) {}

  equals(task?: Task): boolean {
    return this.id.equals(task?.id);
  }

  cloneWith(entryProject?: Project): Task {
    return new Task(this.id, this.title, this.dayOrder, this.priority, this.projectId, entryProject);
  }
}
