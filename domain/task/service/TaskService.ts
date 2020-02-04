import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { Task } from '~/domain/task/entity/Task';

export interface TaskService {
  fetchDailyTasks(): Promise<Either<TogowlError, Task[]>>;
}
