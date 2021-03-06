import { Either } from "owlelia";
import { Label } from "../entity/Label";
import { UpdateTaskError } from "../vo/UpdateTaskError";
import { DeleteTaskError } from "../vo/DeleteTaskError";
import {
  AddTaskError,
  CompleteTaskError,
  FetchLabelsError,
  FetchProjectsError,
  FetchTasksError,
} from "./errors";
import { Task } from "~/domain/task/entity/Task";
import { TaskProject } from "~/domain/task/entity/TaskProject";
import { TaskId } from "~/domain/task/vo/TaskId";
import { DateTime } from "~/domain/common/DateTime";
import { UpdateTasksOrderError } from "~/domain/task/vo/UpdateTasksOrderError";
import { SubscribeTaskError } from "~/domain/task/vo/SubscribeTaskError";

export interface TaskEventListener {
  onStartSubscribe?(): void;
  onEndSubscribe?(): void;
  onError?(err: SubscribeTaskError): void;
  onSyncNeeded?(clientId?: string): void;
  onCompleteTask?(task: Task): void;
}

export interface TaskService {
  fetchTasks(): Promise<Either<FetchTasksError, Task[]>>;
  completeTask(taskId: TaskId): Promise<CompleteTaskError | null>;
  fetchProjects(): Promise<Either<FetchProjectsError, TaskProject[]>>;
  fetchLabels(): Promise<Either<FetchLabelsError, Label[]>>;
  addTask(
    title: string,
    optional: {
      dueDate?: DateTime;
      project?: TaskProject;
      labels?: Label[];
      dayOrder?: number;
    }
  ): Promise<AddTaskError | null>;
  deleteTask(taskId: TaskId): Promise<DeleteTaskError | null>;
  updateTask(
    taskId: TaskId,
    title?: string,
    project?: TaskProject | null,
    labels?: Label[]
  ): Promise<UpdateTaskError | null>;
  updateDueDate(
    taskId: TaskId,
    date: DateTime,
    optional: {
      dayOrder?: number;
    }
  ): Promise<UpdateTaskError | null>;
  updateTasksOrder(taskById: {
    [taskId: string]: Task;
  }): Promise<UpdateTasksOrderError | null>;
  terminate(): void;
}
