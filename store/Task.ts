import _ from "lodash";
import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { UId } from "~/domain/authentication/vo/UId";
import { TogowlError } from "~/domain/common/TogowlError";
import { ActionStatus } from "~/domain/common/ActionStatus";
import { createTaskService } from "~/utils/service-factory";
import { TaskService } from "~/domain/task/service/TaskService";
import { Task } from "~/domain/task/entity/Task";
import {
  FirestoreTask,
  toTaskConfig,
} from "~/repository/FirebaseCloudRepository";
import { TaskConfig } from "~/domain/task/vo/TaskConfig";
import { cloudRepository, projectStore } from "~/store/index";
import { createAction } from "~/utils/firestore-facade";
import { Project } from "~/domain/task/entity/Project";
import { TaskId } from "~/domain/task/vo/TaskId";
import { DateTime } from "~/domain/common/DateTime";

let service: TaskService | null;

interface Command {
  exec(): void;
}

class CompleteCommand implements Command {
  constructor(
    public execFunction: (taskId: TaskId) => Promise<TogowlError | null>,
    public taskId: TaskId
  ) {}

  exec() {
    return this.execFunction(this.taskId);
  }
}

class UpdateDueDateCommand implements Command {
  constructor(
    public execFunction: (
      taskId: TaskId,
      date: DateTime
    ) => Promise<TogowlError | null>,
    public taskId: TaskId,
    public date: DateTime
  ) {}

  exec() {
    return this.execFunction(this.taskId, this.date);
  }
}

class UpdateOrderCommand implements Command {
  constructor(
    public execFunction: (taskById: {
      [taskId: number]: Task;
    }) => Promise<TogowlError | null>,
    public taskById: { [taskId: number]: Task }
  ) {}

  exec() {
    return this.execFunction(this.taskById);
  }
}

interface SyncNeededListener {
  onSyncNeeded(): void;
}

class CommandExecutor {
  commands: Command[] = [];
  syncNeeded = false;
  timerId: number;
  lastExecutedDateTime: DateTime;

  constructor(public listener: SyncNeededListener) {}

  needSync(clientId?: string): CommandExecutor {
    // `clientId is defined` means sync from Todoist official application and others
    if (
      clientId ||
      !this.lastExecutedDateTime ||
      !this.lastExecutedDateTime.within(3)
    ) {
      this.syncNeeded = true;
    }
    return this;
  }

  add(task: Command): CommandExecutor {
    this.commands.push(task);
    return this;
  }

  execAll(delaySeconds = 0): Promise<void> {
    return new Promise((resolve) => {
      if (this.timerId) {
        window.clearTimeout(this.timerId);
      }

      const lastUpdateOrderCommand = _.last(
        this.commands.filter((x) => x instanceof UpdateOrderCommand)
      );
      _.remove(
        this.commands,
        (x) => x instanceof UpdateOrderCommand && x !== lastUpdateOrderCommand
      );

      this.timerId = window.setTimeout(async () => {
        while (this.commands.length > 0) {
          const task = this.commands.shift()!;
          this.lastExecutedDateTime = DateTime.now();
          await task.exec();
        }

        if (this.syncNeeded) {
          this.listener.onSyncNeeded();
          this.syncNeeded = false;
        }

        resolve();
      }, delaySeconds);
    });
  }
}

/**
 * Concrete implementation by using firebase
 */
@Module({ name: "Task", namespaced: true, stateFactory: true })
class TaskModule extends VuexModule {
  private _taskConfig: FirestoreTask | null = null;
  private commandExecutor: CommandExecutor;

  get taskConfig(): TaskConfig | null {
    return this._taskConfig ? toTaskConfig(this._taskConfig) : null;
  }

  get tasks(): Task[] {
    // FIXME: refactoring extract
    return Object.values(this._taskById).map((x) =>
      x.cloneWith(
        x.projectId
          ? projectStore.projectByTaskProjectId[x.projectId.asNumber]
          : undefined
      )
    );
  }

  get tasksOrderAsDay(): Task[] {
    const today = DateTime.now();
    const yesterday = DateTime.now().minusDays(1);
    return _(this.tasks)
      .reject((x) => !x.dueDate)
      .filter(
        (x) =>
          (today.equalsAsDate(x.dueDate!) ||
            yesterday.equalsAsDate(x.dueDate!)) ??
          false
      )
      .orderBy((x) => x.dayOrder)
      .orderBy((x) => x.priority.value, "desc")
      .orderBy((x) => x.dueDate?.unix, "asc")
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

  status: ActionStatus = "init";
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

  projectStatus: ActionStatus = "init";
  @Mutation
  setProjectStatus(status: ActionStatus) {
    this.projectStatus = status;
  }

  projectError: TogowlError | null = null;
  @Mutation
  setProjectError(error: TogowlError | null) {
    this.projectError = error;
  }

  configStatus: ActionStatus = "init";
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
    this.setConfigStatus("in_progress");

    // TODO: Recreate service?
    const err = await cloudRepository.saveTaskConfig(config);
    if (err) {
      this.setConfigStatus("error");
      this.setConfigError(err);
    } else {
      await this.updateService();
      this.setConfigStatus("success");
    }
  }

  @Action({ rawError: true })
  async fetchTasks(): Promise<void> {
    if (!service) {
      return;
    }

    this.setStatus("in_progress");
    await this.commandExecutor.execAll();
    const tasksOrErr = await service.fetchTasks();
    if (tasksOrErr.isLeft()) {
      this.setError(tasksOrErr.error);
      this.setStatus("error");
      return;
    }

    this.setTaskById(_.keyBy(tasksOrErr.value, (x) => x.id.asNumber));
    this.setError(null);
    this.setStatus("success");
  }

  @Action({ rawError: true })
  async completeTask(taskId: TaskId): Promise<void> {
    // TODO: Illegal case
    this.setTaskById(_.omit(this._taskById, [taskId.asNumber]));
    await this.commandExecutor
      .add(new CompleteCommand(service!.completeTask.bind(service), taskId))
      .execAll(1000);
  }

  @Action({ rawError: true })
  async updateDueDate(payload: {
    taskId: TaskId;
    dueDate: DateTime;
  }): Promise<void> {
    const { taskId, dueDate } = payload;
    // TODO: Illegal case
    this.setTaskById({
      ...this._taskById,
      [taskId.asNumber]: this._taskById[taskId.asNumber].cloneWithDueDate(
        dueDate
      ),
    });
    await this.commandExecutor
      .add(
        new UpdateDueDateCommand(
          service!.updateDueDate.bind(service),
          taskId,
          dueDate
        )
      )
      .execAll(1000);
  }

  @Action({ rawError: true })
  async updateTasksOrder(tasks: Task[]): Promise<void> {
    const orderedTasks = _(tasks)
      .map((v, idx) => v.cloneWithDayOrder(idx + 1))
      .keyBy((x) => x.id.asNumber)
      .value();
    this.setTaskById(orderedTasks);
    // TODO: Illegal case
    // TODO: 5000 -> 1000 and restrict when dragging
    await this.commandExecutor
      .add(
        new UpdateOrderCommand(
          service!.updateTasksOrder.bind(service),
          orderedTasks
        )
      )
      .execAll(5000);
  }

  @Action({ rawError: true })
  async fetchProjects(): Promise<void> {
    if (!service) {
      return;
    }

    this.setProjectStatus("in_progress");
    await this.commandExecutor.execAll();
    const projectsOrErr = await service.fetchProjects();
    if (projectsOrErr.isLeft()) {
      this.setProjectError(projectsOrErr.error);
      this.setProjectStatus("error");
      return;
    }

    this.setProjectById(_.keyBy(projectsOrErr.value, (x) => x.id.asNumber));
    this.setProjectError(null);
    this.setProjectStatus("success");
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
      onError: (_err: TogowlError) => this.setError,
      onSyncNeeded: (clientId?: string) => {
        this.commandExecutor.needSync(clientId).execAll(1000);
      },
    });

    // Show quickly as well as we can
    this.fetchTasks();
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.value, "_taskConfig", "task")(this.context);
    this.commandExecutor = new CommandExecutor({
      onSyncNeeded: this.fetchTasks.bind(this),
    });
    await this.updateService();
  }
}

export default TaskModule;
