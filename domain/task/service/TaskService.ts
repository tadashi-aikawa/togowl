import { Either } from "owlelia";
import { Label } from "../entity/Label";
import { UpdateTaskError } from "../vo/UpdateTaskError";
import {
  FetchTasksError,
  CompleteTaskError,
  FetchProjectsError,
  FetchLabelsError,
} from "./errors";
import { Task } from "~/domain/task/entity/Task";
import { Project } from "~/domain/task/entity/Project";
import { TaskId } from "~/domain/task/vo/TaskId";
import { DateTime } from "~/domain/common/DateTime";
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
