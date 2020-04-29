import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { Task } from '~/domain/task/entity/Task';
import { Project } from '~/domain/task/entity/Project';
import { TaskId } from '~/domain/task/vo/TaskId';
import { DateTime } from '~/domain/common/DateTime';

export interface TaskEventListener {
  onStartSubscribe?(): void;
  onEndSubscribe?(): void;
  onError?(err: TogowlError): void;
  onSyncNeeded?(clientId?: string): void;
}

export interface TaskService {
  fetchTasks(): Promise<Either<TogowlError, Task[]>>;
  completeTask(taskId: TaskId): Promise<TogowlError | null>;
  fetchProjects(): Promise<Either<TogowlError, Project[]>>;
  updateDueDate(taskId: TaskId, date: DateTime): Promise<TogowlError | null>;
  updateTasksOrder(taskById: { [taskId: string]: Task }): Promise<TogowlError | null>;
  terminate(): void;
}
