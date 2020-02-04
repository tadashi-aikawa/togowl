import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { Task } from '~/domain/task/entity/Task';
import { Project } from '~/domain/task/entity/Project';

export interface TaskService {
  fetchDailyTasks(): Promise<Either<TogowlError, Task[]>>;
  fetchProjects(): Promise<Either<TogowlError, Project[]>>
}
