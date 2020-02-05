import _ from 'lodash';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { UId } from '~/domain/authentication/vo/UId';
import { TogowlError } from '~/domain/common/TogowlError';
import { ActionStatus } from '~/domain/common/ActionStatus';
import { createTaskService } from '~/utils/service-factory';
import { TaskService } from '~/domain/task/service/TaskService';
import { Task } from '~/domain/task/entity/Task';
import { FirestoreTask, toTaskConfig } from '~/repository/FirebaseCloudRepository';
import { TaskConfig } from '~/domain/task/vo/TaskConfig';
import { fold } from '~/node_modules/fp-ts/lib/Either';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { cloudRepository, projectStore } from '~/store/index';
import { createAction } from '~/utils/firestore-facade';
import { Project } from '~/domain/task/entity/Project';

let service: TaskService | null;

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Task', namespaced: true, stateFactory: true })
class TaskModule extends VuexModule {
  private _taskConfig: FirestoreTask | null = null;

  get taskConfig(): TaskConfig | null {
    return this._taskConfig ? toTaskConfig(this._taskConfig) : null;
  }

  get tasks(): Task[] {
    // FIXME: refactoring extract
    return Object.values(this._taskById).map(x =>
      x.cloneWith(x.projectId ? projectStore.projectByTaskProjectId[x.projectId.asNumber] : undefined),
    );
  }

  get tasksOrderAsDay(): Task[] {
    return _(this.tasks)
      .orderBy(x => x.dayOrder)
      .orderBy(x => x.priority.value, 'desc')
      .orderBy(x => x.dueDate?.unix, 'asc')
      .value();
  }

  get projects(): Project[] {
    return Object.values(this._projectById);
  }

  private _taskById: { [taskId: number]: Task } = {};
  @Mutation
  setTaskById(taskById: { [taskId: number]: Task }) {
    this._taskById = taskById;
  }

  status: ActionStatus = 'init';
  @Mutation
  setStatus(status: ActionStatus) {
    this.status = status;
  }

  error: TogowlError | null = null;
  @Mutation
  setError(error: TogowlError | null) {
    this.error = error;
  }

  private _projectById: { [projectId: number]: Project } = {};
  @Mutation
  setProjectById(projectById: { [projectId: number]: Project }) {
    this._projectById = projectById;
  }

  projectStatus: ActionStatus = 'init';
  @Mutation
  setProjectStatus(status: ActionStatus) {
    this.projectStatus = status;
  }

  projectError: TogowlError | null = null;
  @Mutation
  setProjectError(error: TogowlError | null) {
    this.projectError = error;
  }

  configStatus: ActionStatus = 'init';
  @Mutation
  setConfigStatus(status: ActionStatus) {
    this.configStatus = status;
  }

  configError: TogowlError | null = null;
  @Mutation
  setConfigError(error: TogowlError | null) {
    this.configError = error;
  }

  realtime: boolean = false;
  @Mutation
  setRealtime(realtime: boolean) {
    this.realtime = realtime;
  }

  @Action({ rawError: true })
  async updateTaskConfig(config: TaskConfig) {
    this.setConfigError(null);
    this.setConfigStatus('in_progress');

    // TODO: Recreate service?
    const err = await cloudRepository.saveTaskConfig(config);
    if (err) {
      this.setConfigStatus('error');
      this.setConfigError(err);
    } else {
      await this.updateService();
      this.setConfigStatus('success');
    }
  }

  @Action({ rawError: true })
  async fetchTasks(): Promise<void> {
    this.setStatus('in_progress');
    pipe(
      await service!.fetchDailyTasks(),
      fold(
        err => {
          this.setError(err);
          this.setStatus('error');
        },
        tasks => {
          this.setTaskById(_.keyBy(tasks, x => x.id.asNumber));
          this.setError(null);
          this.setStatus('success');
        },
      ),
    );
  }

  @Action({ rawError: true })
  async completeTask(task: Task): Promise<void> {
    // TODO: Illegal case
    this.setTaskById(_.omit(this._taskById, [task.id.asNumber]));
    service?.completeTask(task);
  }

  @Action({ rawError: true })
  async fetchProjects(): Promise<void> {
    this.setProjectStatus('in_progress');
    pipe(
      await service!.fetchProjects(),
      fold(
        err => {
          this.setProjectError(err);
          this.setProjectStatus('error');
        },
        projects => {
          this.setProjectById(_.keyBy(projects, x => x.id.asNumber));
          this.setProjectError(null);
          this.setProjectStatus('success');
        },
      ),
    );
  }

  @Action({ rawError: true })
  private async updateService(): Promise<void> {
    if (service) {
      service.terminate();
    }

    service = await createTaskService({
      onStartSubscribe: () => {
        this.setRealtime(true);
        this.fetchTasks();
      },
      onEndSubscribe: async () => {
        this.setRealtime(false);
        await this.updateService();
      },
      onError: (err: TogowlError) => this.setError,
      onSyncNeeded: () => {
        this.fetchTasks();
      },
    });
    // Show quickly as well as we can
    this.fetchTasks();
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.value, '_taskConfig', 'task')(this.context);
    await this.updateService();
  }
}

export default TaskModule;
