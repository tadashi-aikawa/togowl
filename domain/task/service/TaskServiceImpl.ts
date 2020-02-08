import _ from 'lodash';
import { Dictionary } from 'lodash';
import logger from '~/utils/global-logger';
import * as todoist from '~/external/todoist';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import { Task } from '~/domain/task/entity/Task';
import { TaskEventListener, TaskService } from '~/domain/task/service/TaskService';
import dayjs from '~/node_modules/dayjs';
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
    logger.put('TaskSI.constructor');
    this.restClient = new todoist.RestApi.RestClient(todoistToken);
    this.syncClient = new todoist.SyncApi.SyncClient(todoistToken);

    this.socketClient = todoist.SocketApi.ApiClient.use(todoistWebSocketToken, {
      onOpen: () => {
        logger.put('TaskCI.onOpen');
        listener.onStartSubscribe?.();
      },
      onClose: event => {
        logger.put('TaskCI.onClose');
        logger.put(`[Code] ${event.code}`);
        logger.put(`[Reason] ${event.reason}`);
        listener.onEndSubscribe?.();
      },
      onError: event => {
        logger.put('TaskCI.onError');
        listener.onError?.(TogowlError.create('SUBSCRIBE_TASK_ERROR', 'Fail to subscribe task event', event.reason));
      },
      onSyncNeeded: () => {
        logger.put('TaskCI.onSyncNeeded');
        listener.onSyncNeeded?.();
      },
    });
  }

  terminate() {
    logger.put('TaskSI.terminate');
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

      const today = dayjs().format('YYYY-MM-DD');
      const yesterday = dayjs()
        .subtract(1, 'day')
        .format('YYYY-MM-DD');
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
      return left(TogowlError.create('FETCH_DAILY_TASKS', "Can't fetch daily tasks from Todoist", err.message));
    }
  }

  private throttleFetchDailyTasks = _.throttle(this._fetchDailyTasks, 1000, { trailing: false });
  fetchDailyTasks(): Promise<Either<TogowlError, Task[]>> {
    return this.throttleFetchDailyTasks();
  }

  async completeTask(taskId: TaskId): Promise<TogowlError | null> {
    try {
      await this.restClient.closeTask(taskId.asNumber);
      return null;
    } catch (err) {
      return TogowlError.create('COMPLETE_TASK', "Can't complete task on Todoist", err.message);
    }
  }

  async updateTasksOrder(taskById: { [taskId: number]: Task }): Promise<TogowlError | null> {
    try {
      const res = (await this.syncClient.syncItemUpdateDayOrders(_.mapValues(taskById, x => x.dayOrder))).data;
      this.itemSyncToken = res.sync_token;
      return null;
    } catch (err) {
      return TogowlError.create('UPDATE_TASKS_ORDER', "Can't update tasks order on Todoist", err.message);
    }
  }

  async fetchProjects(): Promise<Either<TogowlError, Project[]>> {
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
      return left(TogowlError.create('FETCH_PROJECTS', "Can't fetch projects from Todoist", err.message));
    }
  }
}
