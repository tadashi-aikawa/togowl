import { Either } from "owlelia";
import { FetchLabelsError } from "../vo/FetchLabelsError";
import { Label } from "../entity/Label";
import { Task } from "~/domain/task/entity/Task";
import { Project } from "~/domain/task/entity/Project";
import { TaskId } from "~/domain/task/vo/TaskId";
import { DateTime } from "~/domain/common/DateTime";
import { FetchTasksError } from "~/domain/task/vo/FetchTasksError";
import { CompleteTaskError } from "~/domain/task/vo/CompleteTaskError";
import { FetchProjectsError } from "~/domain/task/vo/FetchProjectsError";
import { UpdateTaskError } from "~/domain/task/vo/UpdateTaskError";
import { UpdateTasksOrderError } from "~/domain/task/vo/UpdateTasksOrderError";
import { SubscribeTaskError } from "~/domain/task/vo/SubscribeTaskError";

export interface TaskEventListener {
  onStartSubscribe?(): void;
  onEndSubscribe?(): void;
  onError?(err: SubscribeTaskError): void;
  onSyncNeeded?(clientId?: string): void;
}

export interface TaskService {
  fetchTasks(): Promise<Either<FetchTasksError, Task[]>>;
  completeTask(taskId: TaskId): Promise<CompleteTaskError | null>;
  fetchProjects(): Promise<Either<FetchProjectsError, Project[]>>;
  fetchLabels(): Promise<Either<FetchLabelsError, Label[]>>;
  updateDueDate(
    taskId: TaskId,
    date: DateTime
  ): Promise<UpdateTaskError | null>;
  updateTasksOrder(taskById: {
    [taskId: string]: Task;
  }): Promise<UpdateTasksOrderError | null>;
  terminate(): void;
}
