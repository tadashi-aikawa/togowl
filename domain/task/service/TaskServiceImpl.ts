import _, { Dictionary } from "lodash";
import { Either, left, right } from "owlelia";
import logger from "~/utils/global-logger";
import * as todoist from "~/external/todoist";
import { SyncApi } from "~/external/todoist";
import { Task } from "~/domain/task/entity/Task";
import {
  TaskEventListener,
  TaskService,
} from "~/domain/task/service/TaskService";
import { TaskId } from "~/domain/task/vo/TaskId";
import { ProjectId } from "~/domain/task/vo/ProjectId";
import { Priority } from "~/domain/task/vo/Priority";
import { Project } from "~/domain/task/entity/Project";
import { ProjectName } from "~/domain/task/vo/ProjectlName";
import { DateTime } from "~/domain/common/DateTime";
import { SubscribeTaskError } from "~/domain/task/vo/SubscribeTaskError";
import { FetchTasksError } from "~/domain/task/vo/FetchTasksError";
import { CompleteTaskError } from "~/domain/task/vo/CompleteTaskError";
import { UpdateTaskError } from "~/domain/task/vo/UpdateTaskError";
import { UpdateTasksOrderError } from "~/domain/task/vo/UpdateTasksOrderError";
import { FetchProjectsError } from "~/domain/task/vo/FetchProjectsError";

export class TaskServiceImpl implements TaskService {
  private syncClient: todoist.SyncApi.SyncClient;
  private socketClient: todoist.SocketApi.ApiClient;

  private todoistSyncToken: string = "*";
  private taskById: Dictionary<todoist.SyncApi.Task>;
  private projectById: Dictionary<todoist.SyncApi.Project>;

  private get shortTodoistSyncToken(): string {
    return this.todoistSyncToken.slice(0, 7);
  }

  constructor(
    todoistToken: string,
    todoistWebSocketToken: string,
    listener: TaskEventListener
  ) {
    logger.put("new TaskService");
    this.syncClient = new todoist.SyncApi.SyncClient(todoistToken);

    this.socketClient = todoist.SocketApi.ApiClient.use(todoistWebSocketToken, {
      onOpen: () => {
        logger.put("TaskService.onOpen");
        listener.onStartSubscribe?.();
      },
      onClose: (event) => {
        logger.put(`TaskService.onClose: ${event.code}`);
        listener.onEndSubscribe?.();
      },
      onError: (event) => {
        logger.put("TaskService.onError");
        listener.onError?.(
          SubscribeTaskError.of({
            stack: event.reason,
          })
        );
      },
      onSyncNeeded: (clientId?: string) => {
        logger.put("TaskService.onSyncNeeded");
        listener.onSyncNeeded?.(clientId);
      },
    });
  }

  terminate() {
    logger.put("TaskService.terminate");
    this.socketClient.terminate();
  }

  private static toTask(task: todoist.SyncApi.Task): Task {
    return Task.of({
      id: TaskId.of(task.id),
      title: task.content,
      dayOrder: task.day_order,
      priority: Priority.try(task.priority).orThrow(),
      projectId: task.project_id ? ProjectId.of(task.project_id) : undefined,
      dueDate: task.due ? DateTime.of(task.due.date) : undefined,
    });
  }

  private static toProject(project: todoist.SyncApi.Project): Project {
    return Project.of({
      id: ProjectId.of(project.id),
      name: ProjectName.of(project.name),
    });
  }

  private syncCloudToInstance(res: SyncApi.Root) {
    this.todoistSyncToken = res.sync_token;

    if (res.full_sync) {
      this.taskById = _.keyBy(res.items, (x) => x.id);
    } else {
      this.taskById = { ...this.taskById, ..._.keyBy(res.items, (x) => x.id) };
    }

    if (res.full_sync) {
      this.projectById = _.keyBy(res.projects, (x) => x.id);
    } else {
      this.projectById = {
        ...this.projectById,
        ..._.keyBy(res.projects, (x) => x.id),
      };
    }

    if (!_.isEmpty(res.day_orders)) {
      this.taskById = _.mapValues(this.taskById, (task) =>
        res.day_orders![task.id]
          ? { ...task, day_order: res.day_orders![task.id] }
          : task
      );
    }
  }

  async fetchTasks(): Promise<Either<FetchTasksError, Task[]>> {
    logger.put(`TaskService.fetchTasks: ${this.shortTodoistSyncToken}`);
    try {
      const res = (await this.syncClient.syncAll(this.todoistSyncToken)).data;
      logger.put(
        `TaskService.fetchTasks.success: ${this.shortTodoistSyncToken}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.fetchTasks.success (sync to local): ${this.shortTodoistSyncToken}`
      );

      return right(
        _(this.taskById)
          .values()
          .reject((x) => x.is_deleted === 1)
          .reject((x) => x.checked === 1)
          .map((x) => TaskServiceImpl.toTask(x))
          .value()
      );
    } catch (err) {
      console.error(err);
      logger.put(`TaskService.fetchTasks.error: ${this.shortTodoistSyncToken}`);
      return left(
        FetchTasksError.of({
          stack: err.stack,
        })
      );
    }
  }

  async completeTask(taskId: TaskId): Promise<CompleteTaskError | null> {
    logger.put(`TaskService.completeTask: ${this.shortTodoistSyncToken}`);
    try {
      const res = (
        await this.syncClient.syncItemClose(
          taskId.asNumber,
          this.todoistSyncToken
        )
      ).data;
      logger.put(
        `TaskService.completeTask.success: ${this.shortTodoistSyncToken}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.completeTask.success (sync to local): ${this.shortTodoistSyncToken}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.completeTask.error: ${this.shortTodoistSyncToken}`
      );
      return CompleteTaskError.of({
        taskId,
        stack: err.stack,
      });
    }
  }

  async updateDueDate(
    taskId: TaskId,
    date: DateTime
  ): Promise<UpdateTaskError | null> {
    logger.put(`TaskService.updateDueDate: ${this.shortTodoistSyncToken}`);
    const task = this.taskById[taskId.unwrap()]!;
    const due = { ...task.due, date: date.displayDate };
    try {
      const res = (
        await this.syncClient.syncItemUpdate(
          taskId.asNumber,
          due,
          this.todoistSyncToken
        )
      ).data;
      logger.put(
        `TaskService.updateDueDate.success: ${this.shortTodoistSyncToken}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.updateDueDate.success (sync to local): ${this.shortTodoistSyncToken}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.updateDueDate.error: ${this.shortTodoistSyncToken}`
      );
      return UpdateTaskError.of({
        taskId,
        detail: "Can't update due date on Todoist",
        stack: err.stack,
      });
    }
  }

  async updateTasksOrder(taskById: {
    [taskId: number]: Task;
  }): Promise<UpdateTasksOrderError | null> {
    logger.put(`TaskService.updateTaskOrder: ${this.shortTodoistSyncToken}`);
    try {
      const res = (
        await this.syncClient.syncItemUpdateDayOrders(
          _.mapValues(taskById, (x) => x.dayOrder),
          this.todoistSyncToken
        )
      ).data;
      logger.put(
        `TaskService.updateTaskOrder.success: ${this.shortTodoistSyncToken}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.updateTaskOrder.success (sync to local): ${this.shortTodoistSyncToken}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.updateTaskOrder.error: ${this.shortTodoistSyncToken}`
      );
      return UpdateTasksOrderError.of({
        stack: err.stack,
      });
    }
  }

  async fetchProjects(): Promise<Either<FetchProjectsError, Project[]>> {
    logger.put(`TaskService.fetchProjects: ${this.shortTodoistSyncToken}`);
    try {
      const res = (await this.syncClient.syncAll(this.todoistSyncToken)).data;
      logger.put(
        `TaskService.fetchProjects.success: ${this.shortTodoistSyncToken}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.fetchProjects.success (sync to local): ${this.shortTodoistSyncToken}`
      );

      return right(
        _(this.projectById)
          .values()
          .reject((x) => x.is_deleted === 1)
          .map((x) => TaskServiceImpl.toProject(x))
          .value()
      );
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.fetchProjects.error: ${this.shortTodoistSyncToken}`
      );
      return left(
        FetchProjectsError.of({
          stack: err.stack,
        })
      );
    }
  }
}
