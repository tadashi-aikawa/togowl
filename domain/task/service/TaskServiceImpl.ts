import _ from 'lodash';
import { Dictionary } from 'lodash';
import logger from '~/utils/global-logger';
import * as todoist from '~/external/todoist';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import { Task } from '~/domain/task/entity/Task';
import { TaskService } from '~/domain/task/service/TaskService';
import dayjs from '~/node_modules/dayjs';
import { TaskId } from '~/domain/task/vo/TaskId';
import { ProjectId } from '~/domain/task/vo/ProjectId';
import { Priority } from '~/domain/task/vo/Priority';
import { Project } from '~/domain/task/entity/Project';
import { ProjectName } from '~/domain/task/vo/ProjectlName';

export class TaskServiceImpl implements TaskService {
  private restClient: todoist.RestApi.RestClient;
  private syncClient: todoist.SyncApi.SyncClient;

  private itemSyncToken: string = '*';
  private taskById: Dictionary<todoist.SyncApi.Task>;

  private projectSyncToken: string = '*';
  private projectById: Dictionary<todoist.SyncApi.Project>;

  constructor(todoistToken: string) {
    logger.put('TaskSI.constructor');
    this.restClient = new todoist.RestApi.RestClient(todoistToken);
    this.syncClient = new todoist.SyncApi.SyncClient(todoistToken);
  }

  terminate() {
    logger.put('TaskSI.terminate');
    // TODO stop streaming
  }

  private toTask(task: todoist.SyncApi.Task): Task {
    return new Task(
      TaskId.create(task.id),
      task.content,
      task.day_order,
      Priority.create(task.priority),
      task.project_id ? ProjectId.create(task.project_id) : undefined,
    );
  }

  private toProject(project: todoist.SyncApi.Project): Project {
    return new Project(ProjectId.create(project.id), ProjectName.create(project.name));
  }

  async fetchDailyTasks(): Promise<Either<TogowlError, Task[]>> {
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
      // TODO: startsWith使わずに、dayjsオブジェクト作ってちゃんと書く
      return right(
        _(this.taskById)
          .values()
          .filter(x => x.due?.date.startsWith(today) ?? false)
          .reject(x => x.is_deleted === 1)
          .reject(x => x.checked === 1)
          .map(x => this.toTask(x))
          .value(),
      );
    } catch (err) {
      return left(TogowlError.create('FETCH_DAILY_TASKS', "Can't fetch daily tasks from Todoist", err.message));
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

  // async closeTask(taskId: number): Promise<void> {
  //   const client = new RestApi.Client(this.token);
  // return client.closeTask(taskId).then();
  // }
}
