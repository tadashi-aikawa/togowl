import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { Task } from '~/domain/task/entity/Task';
import { Project } from '~/domain/task/entity/Project';
import { TaskId } from '~/domain/task/vo/TaskId';

export interface TaskEventListener {
  onStartSubscribe?(): void;
  onEndSubscribe?(): void;
  onError?(err: TogowlError): void;
  onSyncNeeded?(): void;
}

export interface TaskService {
  fetchDailyTasks(): Promise<Either<TogowlError, Task[]>>;
  completeTask(taskId: TaskId): Promise<TogowlError | null>;
  fetchProjects(): Promise<Either<TogowlError, Project[]>>;
  terminate(): void;
}
