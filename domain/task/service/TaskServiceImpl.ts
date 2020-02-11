import _, { Dictionary } from 'lodash';
import logger from '~/utils/global-logger';
import * as todoist from '~/external/todoist';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import { Task } from '~/domain/task/entity/Task';
import { TaskEventListener, TaskService } from '~/domain/task/service/TaskService';
import { TaskId } from '~/domain/task/vo/TaskId';
import { ProjectId } from '~/domain/task/vo/ProjectId';
import { Priority } from '~/domain/task/vo/Priority';
import { Project } from '~/domain/task/entity/Project';
import { ProjectName } from '~/domain/task/vo/ProjectlName';
import { DateTime } from '~/domain/common/DateTime';

export class TaskServiceImpl implements TaskService {
  private restClient: todoist.RestApi.RestClient;
  private syncClient: todoist.SyncApi.SyncClient;
  private socketClient: todoist.SocketApi.ApiClient;

  private itemSyncToken: string = '*';
  private taskById: Dictionary<todoist.SyncApi.Task>;

  private projectSyncToken: string = '*';
  private projectById: Dictionary<todoist.SyncApi.Project>;

  constructor(todoistToken: string, todoistWebSocketToken: string, listener: TaskEventListener) {
    logger.put('new TaskService');
    this.restClient = new todoist.RestApi.RestClient(todoistToken);
    this.syncClient = new todoist.SyncApi.SyncClient(todoistToken);

    const debounceOnSyncNeeded = _.debounce(() => {
      logger.put('TaskService.onSyncNeeded');
      listener.onSyncNeeded?.();
    }, 3000);

    this.socketClient = todoist.SocketApi.ApiClient.use(todoistWebSocketToken, {
      onOpen: () => {
        logger.put('TaskService.onOpen');
        listener.onStartSubscribe?.();
      },
      onClose: event => {
        logger.put(`TaskService.onClose: ${event.code}`);
        listener.onEndSubscribe?.();
      },
      onError: event => {
        logger.put('TaskService.onError');
        listener.onError?.(TogowlError.create('SUBSCRIBE_TASK_ERROR', 'Fail to subscribe task event', event.reason));
      },
      onSyncNeeded: () => {
        logger.put('TaskService.onSyncNeeded (Before debounce)');
        debounceOnSyncNeeded();
      },
    });
  }

  terminate() {
    logger.put('TaskService.terminate');
    this.socketClient.terminate();
  }

  private toTask(task: todoist.SyncApi.Task): Task {
    return new Task(
      TaskId.create(task.id),
      task.content,
      task.day_order,
      Priority.create(task.priority),
      task.project_id ? ProjectId.create(task.project_id) : undefined,
      undefined,
      task.due ? DateTime.create(task.due.date) : undefined,
    );
  }

  private toProject(project: todoist.SyncApi.Project): Project {
    return new Project(ProjectId.create(project.id), ProjectName.create(project.name));
  }

  async _fetchDailyTasks(): Promise<Either<TogowlError, Task[]>> {
    logger.put(`TaskService.fetchDailyTasks: ${this.itemSyncToken}`);
    try {
      const res = (await this.syncClient.sync(['items', 'day_orders'], this.itemSyncToken)).data;
      this.itemSyncToken = res.sync_token;

      if (res.full_sync) {
        this.taskById = _.keyBy(res.items, x => x.id);
      } else {
        this.taskById = { ...this.taskById, ..._.keyBy(res.items, x => x.id) };
      }

      if (!_.isEmpty(res.day_orders)) {
        this.taskById = _.mapValues(this.taskById, task =>
          res.day_orders![task.id] ? { ...task, day_order: res.day_orders![task.id] } : task,
        );
      }

      const today = DateTime.now().displayDate;
      const yesterday = DateTime.now().minusDays(1).displayDate;
      return right(
        _(this.taskById)
          .values()
          .filter(x => (x.due?.date.startsWith(today) || x.due?.date.startsWith(yesterday)) ?? false)
          .reject(x => x.is_deleted === 1)
          .reject(x => x.checked === 1)
          .map(x => this.toTask(x))
          .value(),
      );
    } catch (err) {
      console.error(err);
      return left(TogowlError.create('FETCH_DAILY_TASKS', "Can't fetch daily tasks from Todoist", err.message));
    }
  }

  private throttleFetchDailyTasks = _.throttle(this._fetchDailyTasks, 2000, { trailing: false });
  fetchDailyTasks(): Promise<Either<TogowlError, Task[]>> {
    logger.put('TaskService.fetchDailyTasks (Before throttle 2s)');
    return this.throttleFetchDailyTasks();
  }

  async completeTask(taskId: TaskId): Promise<TogowlError | null> {
    logger.put(`TaskService.completeTask: ${this.itemSyncToken}`);
    try {
      await this.restClient.closeTask(taskId.asNumber);
      return null;
    } catch (err) {
      console.error(err);
      return TogowlError.create('COMPLETE_TASK', "Can't complete task on Todoist", err.message);
    }
  }

  async _updateTasksOrder(taskById: { [taskId: number]: Task }): Promise<TogowlError | null> {
    logger.put(`TaskService.updateTaskOrder: ${this.itemSyncToken}`);
    try {
      const res = (await this.syncClient.syncItemUpdateDayOrders(_.mapValues(taskById, x => x.dayOrder))).data;
      this.itemSyncToken = res.sync_token;
      this.taskById = _.mapValues(this.taskById, task =>
        // XXX: `: task` is right? should day_order to be -1??
        taskById[task.id] ? { ...task, day_order: taskById[task.id].dayOrder } : task,
      );
      return null;
    } catch (err) {
      console.error(err);
      return TogowlError.create('UPDATE_TASKS_ORDER', "Can't update tasks order on Todoist", err.message);
    }
  }
  private debounceUpdateTasksOrder = _.debounce(this._updateTasksOrder, 5000);
  async updateTasksOrder(taskById: { [taskId: number]: Task }): Promise<TogowlError | null> {
    logger.put(`TaskService.updateTaskOrder (Before debounce 5s)`);
    return this.debounceUpdateTasksOrder(taskById);
  }

  async fetchProjects(): Promise<Either<TogowlError, Project[]>> {
    logger.put(`TaskService.fetchProjects: ${this.itemSyncToken}`);
    try {
      const res = (await this.syncClient.sync(['projects'], this.projectSyncToken)).data;
      this.projectSyncToken = res.sync_token;

      if (res.full_sync) {
        this.projectById = _.keyBy(res.projects, x => x.id);
      } else {
        this.projectById = { ...this.projectById, ..._.keyBy(res.projects, x => x.id) };
      }

      return right(
        _(this.projectById)
          .values()
          .reject(x => x.is_deleted === 1)
          .map(x => this.toProject(x))
          .value(),
      );
    } catch (err) {
      console.error(err);
      return left(TogowlError.create('FETCH_PROJECTS', "Can't fetch projects from Todoist", err.message));
    }
  }
}
