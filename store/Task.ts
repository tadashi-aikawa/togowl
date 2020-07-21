import _ from "lodash";
import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import {
  CommandExecutor,
  CompleteCommand,
  UpdateDueDateCommand,
  UpdateOrderCommand,
} from "./commands/TaskCommand";
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
import { TaskProject } from "~/domain/task/entity/TaskProject";
import { TaskId } from "~/domain/task/vo/TaskId";
import { DateTime } from "~/domain/common/DateTime";
import { Label } from "~/domain/task/entity/Label";

let service: TaskService | null;

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

  get taskById(): { [taskId: number]: Task } {
    return _.mapValues(this._taskById, (x) =>
      x.cloneWith({
        entryProject: x.projectId
          ? projectStore.projectByTaskProjectId[x.projectId.asNumber]
          : undefined,
        labels: x.labelIds
          .map((id) => this._labelById[id.asNumber])
          .filter((x) => x),
      })
    );
  }

  get tasks(): Task[] {
    return Object.values(this.taskById);
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
      .orderBy((x) => x.priority.number, "desc")
      .orderBy((x) => x.dueDate?.unix, "asc")
      .value();
  }

  get projects(): TaskProject[] {
    return Object.values(this._projectById);
  }

  get projectById(): { [projectId: number]: TaskProject } {
    return this._projectById;
  }

  get labels(): Label[] {
    return Object.values(this._labelById);
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

  private _projectById: { [projectId: number]: TaskProject } = {};
  @Mutation
  setProjectById(projectById: { [projectId: number]: TaskProject }) {
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

  private _labelById: { [labelId: number]: Label } = {};
  @Mutation
  setLabelById(labelById: { [labelId: number]: Label }) {
    this._labelById = labelById;
  }

  labelStatus: ActionStatus = "init";
  @Mutation
  setLabelStatus(status: ActionStatus) {
    this.labelStatus = status;
  }

  labelError: TogowlError | null = null;
  @Mutation
  setLabelError(error: TogowlError | null) {
    this.labelError = error;
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
  async addTask(payload: {
    title: string;
    dueDate?: DateTime;
    project?: TaskProject;
    labels?: Label[];
  }): Promise<TogowlError | undefined> {
    const { title, dueDate, project, labels } = payload;
    const err = await service!.addTask(title, { dueDate, project, labels });
    if (err) {
      this.setError(err);
      this.setStatus("error");
      return err;
    }

    this.setError(null);
    this.setStatus("success");
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
      [taskId.asNumber]: this._taskById[taskId.asNumber].cloneWith({ dueDate }),
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
      .map((v, idx) =>
        v.cloneWith({
          dayOrder: idx + 1,
        })
      )
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
    // なぜかデッドロックっぽい挙動になるので消す...
    // await this.commandExecutor.execAll();
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
  async fetchLabels(): Promise<void> {
    if (!service) {
      return;
    }

    this.setLabelStatus("in_progress");
    // なぜかデッドロックっぽい挙動になるので消す...
    // await this.commandExecutor.execAll();
    const labelsOrErr = await service.fetchLabels();
    if (labelsOrErr.isLeft()) {
      this.setLabelError(labelsOrErr.error);
      this.setLabelStatus("error");
      return;
    }

    this.setLabelById(_.keyBy(labelsOrErr.value, (x) => x.idAsNumber));
    this.setLabelError(null);
    this.setLabelStatus("success");
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

    // TODO: retry when labels are updated.
    this.fetchLabels();
    // Show quickly as well as we can
    this.fetchTasks();
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.unwrap(), "_taskConfig", "task")(this.context);
    this.commandExecutor = new CommandExecutor({
      onSyncNeeded: this.fetchTasks.bind(this),
    });
    await this.updateService();
  }
}

export default TaskModule;
