import _, { Dictionary } from "lodash";
import logger from "~/utils/global-logger";
import * as todoist from "~/external/todoist";
import { SyncApi } from "~/external/todoist";
import { TogowlError } from "~/domain/common/TogowlError";
import { Either, left, right } from "~/node_modules/fp-ts/lib/Either";
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

export class TaskServiceImpl implements TaskService {
  private syncClient: todoist.SyncApi.SyncClient;
  private socketClient: todoist.SocketApi.ApiClient;

  private todoistSyncToken: string = "*";
  private taskById: Dictionary<todoist.SyncApi.Task>;
  private projectById: Dictionary<todoist.SyncApi.Project>;

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
          TogowlError.create(
            "SUBSCRIBE_TASK_ERROR",
            "Fail to subscribe task event",
            event.reason
          )
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
    return new Task(
      TaskId.create(task.id),
      task.content,
      task.day_order,
      Priority.create(task.priority),
      task.project_id ? ProjectId.create(task.project_id) : undefined,
      undefined,
      task.due ? DateTime.create(task.due.date) : undefined
    );
  }

  private static toProject(project: todoist.SyncApi.Project): Project {
    return new Project(
      ProjectId.create(project.id),
      ProjectName.create(project.name)
    );
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

  async fetchTasks(): Promise<Either<TogowlError, Task[]>> {
    logger.put(`TaskService.fetchTasks: ${this.todoistSyncToken.slice(0, 7)}`);
    try {
      const res = (await this.syncClient.syncAll(this.todoistSyncToken)).data;
      logger.put(
        `TaskService.fetchTasks.success: ${this.todoistSyncToken.slice(0, 7)}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.fetchTasks.success (sync to local): ${this.todoistSyncToken.slice(
          0,
          7
        )}`
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
      logger.put(
        `TaskService.fetchTasks.error: ${this.todoistSyncToken.slice(0, 7)}`
      );
      return left(
        TogowlError.create(
          "FETCH_DAILY_TASKS",
          "Can't fetch daily tasks from Todoist",
          err.message
        )
      );
    }
  }

  async completeTask(taskId: TaskId): Promise<TogowlError | null> {
    logger.put(
      `TaskService.completeTask: ${this.todoistSyncToken.slice(0, 7)}`
    );
    try {
      const res = (
        await this.syncClient.syncItemClose(
          taskId.asNumber,
          this.todoistSyncToken
        )
      ).data;
      logger.put(
        `TaskService.completeTask.success: ${this.todoistSyncToken.slice(0, 7)}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.completeTask.success (sync to local): ${this.todoistSyncToken.slice(
          0,
          7
        )}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.completeTask.error: ${this.todoistSyncToken.slice(0, 7)}`
      );
      return TogowlError.create(
        "COMPLETE_TASK",
        "Can't complete task on Todoist",
        err.message
      );
    }
  }

  async updateDueDate(
    taskId: TaskId,
    date: DateTime
  ): Promise<TogowlError | null> {
    logger.put(
      `TaskService.updateDueDate: ${this.todoistSyncToken.slice(0, 7)}`
    );
    const task = this.taskById[taskId.value]!;
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
        `TaskService.updateDueDate.success: ${this.todoistSyncToken.slice(
          0,
          7
        )}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.updateDueDate.success (sync to local): ${this.todoistSyncToken.slice(
          0,
          7
        )}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.updateDueDate.error: ${this.todoistSyncToken.slice(0, 7)}`
      );
      return TogowlError.create(
        "UPDATE_DUE_DATE",
        "Can't update due date on Todoist",
        err.message
      );
    }
  }

  async updateTasksOrder(taskById: {
    [taskId: number]: Task;
  }): Promise<TogowlError | null> {
    logger.put(
      `TaskService.updateTaskOrder: ${this.todoistSyncToken.slice(0, 7)}`
    );
    try {
      const res = (
        await this.syncClient.syncItemUpdateDayOrders(
          _.mapValues(taskById, (x) => x.dayOrder),
          this.todoistSyncToken
        )
      ).data;
      logger.put(
        `TaskService.updateTaskOrder.success: ${this.todoistSyncToken.slice(
          0,
          7
        )}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.updateTaskOrder.success (sync to local): ${this.todoistSyncToken.slice(
          0,
          7
        )}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.updateTaskOrder.error: ${this.todoistSyncToken.slice(
          0,
          7
        )}`
      );
      return TogowlError.create(
        "UPDATE_TASKS_ORDER",
        "Can't update tasks order on Todoist",
        err.message
      );
    }
  }

  async fetchProjects(): Promise<Either<TogowlError, Project[]>> {
    logger.put(
      `TaskService.fetchProjects: ${this.todoistSyncToken.slice(0, 7)}`
    );
    try {
      const res = (await this.syncClient.syncAll(this.todoistSyncToken)).data;
      logger.put(
        `TaskService.fetchProjects.success: ${this.todoistSyncToken.slice(
          0,
          7
        )}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.fetchProjects.success (sync to local): ${this.todoistSyncToken.slice(
          0,
          7
        )}`
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
        `TaskService.fetchProjects.error: ${this.todoistSyncToken.slice(0, 7)}`
      );
      return left(
        TogowlError.create(
          "FETCH_PROJECTS",
          "Can't fetch projects from Todoist",
          err.message
        )
      );
    }
  }
}
