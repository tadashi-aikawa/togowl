import _, { Dictionary } from "lodash";
import { Either, left, right } from "owlelia";
import { LazyGetter } from "lazy-get-decorator";
import { Label } from "../entity/Label";
import { DeleteTaskError } from "../vo/DeleteTaskError";
import {
  AddTaskError,
  CompleteTaskError,
  FetchLabelsError,
  FetchProjectsError,
  FetchTasksError,
} from "./errors";
import logger from "~/utils/global-logger";
import * as todoist from "~/external/todoist";
import { Task } from "~/domain/task/entity/Task";
import {
  TaskEventListener,
  TaskService,
} from "~/domain/task/service/TaskService";
import { TaskId } from "~/domain/task/vo/TaskId";
import { ProjectId } from "~/domain/task/vo/ProjectId";
import { Priority } from "~/domain/task/vo/Priority";
import { TaskProject } from "~/domain/task/entity/TaskProject";
import { ProjectName } from "~/domain/task/vo/ProjectlName";
import { DateTime } from "~/domain/common/DateTime";
import { SubscribeTaskError } from "~/domain/task/vo/SubscribeTaskError";
import { UpdateTaskError } from "~/domain/task/vo/UpdateTaskError";
import { UpdateTasksOrderError } from "~/domain/task/vo/UpdateTasksOrderError";
import { Note } from "~/domain/task/entity/Note";
import { NoteId } from "~/domain/task/vo/NoteId";
import { LabelId } from "~/domain/task/vo/LabelId";
import { Url } from "~/domain/common/Url";
import { todoistToMarkdown } from "~/utils/string";

const inboxProjectIdMemoize = LazyGetter();
const notesMemoize = LazyGetter();

export class TodoistTaskService implements TaskService {
  private syncClient: todoist.SyncApi.SyncClient;
  private socketClient: todoist.SocketApi.ApiClient;

  private todoistSyncToken: string = "*";
  private taskById: Dictionary<todoist.SyncApi.Task>;
  private projectById: Dictionary<todoist.SyncApi.Project>;
  private labelsById: Dictionary<todoist.SyncApi.Label>;
  private notesById: Dictionary<todoist.SyncApi.Note>;

  private listener: TaskEventListener;

  @inboxProjectIdMemoize
  private get inboxProjectId(): number {
    return _(this.projectById).find((x) => x.inbox_project)!.id;
  }

  @notesMemoize
  private get notesByTaskId(): Dictionary<todoist.SyncApi.Note[]> {
    return _(this.notesById)
      .values()
      .reject((x) => x.is_deleted === 1)
      .groupBy((x) => x.item_id)
      .value();
  }

  private get shortTodoistSyncToken(): string {
    return this.todoistSyncToken.slice(0, 7);
  }

  constructor(
    todoistToken: string,
    todoistWebSocketToken: string,
    listener: TaskEventListener
  ) {
    logger.put("new TaskService");
    this.listener = listener;
    this.syncClient = new todoist.SyncApi.SyncClient(todoistToken);

    this.socketClient = todoist.SocketApi.ApiClient.use(todoistWebSocketToken, {
      onOpen: () => {
        logger.put("TaskService.onOpen");
        this.listener.onStartSubscribe?.();
      },
      onClose: (event) => {
        logger.put(`TaskService.onClose: ${event.code}`);
        this.listener.onEndSubscribe?.();
      },
      onError: (event) => {
        logger.put("TaskService.onError");
        this.listener.onError?.(
          SubscribeTaskError.of({ message: event.reason })
        );
      },
      onSyncNeeded: (clientId?: string) => {
        logger.put("TaskService.onSyncNeeded");
        this.listener.onSyncNeeded?.(clientId);
      },
    });
  }

  terminate() {
    logger.put("TaskService.terminate");
    this.socketClient.terminate();
  }

  private static toNote(note: todoist.SyncApi.Note): Note {
    return Note.of({
      id: NoteId.of(note.id),
      body: note.content,
      createdAt: DateTime.of(note.posted),
    });
  }

  private toTask(task: todoist.SyncApi.Task): Task {
    return Task.of({
      id: TaskId.of(task.id),
      title: todoistToMarkdown(task.content),
      dayOrder: task.day_order,
      priority: Priority.try(task.priority).orThrow(),
      editableUrl: Url.try(
        `https://todoist.com/app?#task%2F${task.id}`
      ).orThrow(),
      projectId: task.project_id ? ProjectId.of(task.project_id) : undefined,
      labelIds: task.labels.map(LabelId.of),
      dueDate: task.due ? DateTime.of(task.due.date) : undefined,
      isRecurring: task.due?.is_recurring ?? false,
      recurringContent: task.due?.string,
      notes: this.notesByTaskId[task.id]?.map(TodoistTaskService.toNote),
      checked: task.checked === 1,
      deleted: task.is_deleted === 1,
    });
  }

  private static toProject(project: todoist.SyncApi.Project): TaskProject {
    return TaskProject.of({
      id: ProjectId.of(project.id),
      name: ProjectName.of(project.name),
    });
  }

  private static toLabel(label: todoist.SyncApi.Label): Label {
    return Label.of({
      id: LabelId.of(label.id),
      name: label.name,
    });
  }

  private syncCloudToInstance(res: todoist.SyncApi.Root) {
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

    if (res.full_sync) {
      this.labelsById = _.keyBy(res.labels, (x) => x.id);
    } else {
      this.labelsById = {
        ...this.labelsById,
        ..._.keyBy(res.labels, (x) => x.id),
      };
    }

    notesMemoize.reset(this);
    if (res.full_sync) {
      this.notesById = _.keyBy(res.notes, (x) => x.id);
    } else {
      this.notesById = {
        ...this.notesById,
        ..._.keyBy(res.notes, (x) => x.id),
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

      return right(_.map(this.taskById, (x) => this.toTask(x)));
    } catch (err) {
      console.error(err);
      logger.put(`TaskService.fetchTasks.error: ${this.shortTodoistSyncToken}`);
      return left(
        FetchTasksError.of({
          message: err.message,
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
      this.listener.onCompleteTask?.(
        this.toTask(this.taskById[taskId.unwrap()])
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.completeTask.error: ${this.shortTodoistSyncToken}`
      );
      return CompleteTaskError.of({
        taskId,
      });
    }
  }

  async addTask(
    title: string,
    optional: {
      dueDate?: DateTime;
      project?: TaskProject;
      labels?: Label[];
      dayOrder?: number;
    }
  ): Promise<AddTaskError | null> {
    logger.put(`TaskService.addTask: ${this.shortTodoistSyncToken}`);
    try {
      const res = (
        await this.syncClient.syncItemAdd(
          "temp_id",
          title,
          { date: optional.dueDate?.displayDate },
          optional.project?.id.asNumber,
          optional.labels?.map((x) => x.idAsNumber),
          optional.dayOrder,
          this.todoistSyncToken
        )
      ).data;
      logger.put(`TaskService.addTask.success: ${this.shortTodoistSyncToken}`);
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.addTask.success (sync to local): ${this.shortTodoistSyncToken}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(`TaskService.addTask.error: ${this.shortTodoistSyncToken}`);
      return AddTaskError.of({
        title,
        detail: "Can't add a task to Todoist",
      });
    }
  }

  async deleteTask(taskId: TaskId): Promise<DeleteTaskError | null> {
    logger.put(`TaskService.deleteTask: ${this.shortTodoistSyncToken}`);
    try {
      const res = (
        await this.syncClient.syncItemDelete(
          taskId.asNumber,
          this.todoistSyncToken
        )
      ).data;
      logger.put(
        `TaskService.deleteTask.success: ${this.shortTodoistSyncToken}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.deleteTask.success (sync to local): ${this.shortTodoistSyncToken}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(`TaskService.deleteTask.error: ${this.shortTodoistSyncToken}`);
      return DeleteTaskError.of({
        taskId,
        detail: "Can't delete a task on Todoist",
      });
    }
  }

  async updateTask(
    taskId: TaskId,
    title?: string,
    project?: TaskProject | null,
    labels?: Label[]
  ): Promise<UpdateTaskError | null> {
    logger.put(`TaskService.updateTask: ${this.shortTodoistSyncToken}`);

    try {
      const res = (
        await this.syncClient.syncItemUpdate(
          taskId.asNumber,
          this.todoistSyncToken,
          {
            content: title,
            projectId:
              project === null ? this.inboxProjectId : project?.id.asNumber,
            labels: labels?.map((x) => x.idAsNumber),
          }
        )
      ).data;
      logger.put(
        `TaskService.updateTask.success: ${this.shortTodoistSyncToken}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.updateTask.success (sync to local): ${this.shortTodoistSyncToken}`
      );
      return null;
    } catch (err) {
      console.error(err);
      logger.put(`TaskService.updateTask.error: ${this.shortTodoistSyncToken}`);
      return UpdateTaskError.of({
        taskId,
        detail: "Can't update a task on Todoist",
      });
    }
  }

  async updateDueDate(
    taskId: TaskId,
    date: DateTime,
    optional: {
      dayOrder: number;
    }
  ): Promise<UpdateTaskError | null> {
    logger.put(`TaskService.updateDueDate: ${this.shortTodoistSyncToken}`);
    const task = this.taskById[taskId.unwrap()]!;
    const due = {
      ...task.due,
      date: date.isStartOfDay ? date.displayDate : date.rfc3339WithoutTimezone,
    };

    try {
      const res = (
        await this.syncClient.syncItemUpdate(
          taskId.asNumber,
          this.todoistSyncToken,
          { due, dayOrder: optional.dayOrder }
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
      return UpdateTasksOrderError.of();
    }
  }

  async fetchProjects(): Promise<Either<FetchProjectsError, TaskProject[]>> {
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
          .map((x) => TodoistTaskService.toProject(x))
          .value()
      );
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.fetchProjects.error: ${this.shortTodoistSyncToken}`
      );
      return left(FetchProjectsError.of());
    }
  }

  async fetchLabels(): Promise<Either<FetchLabelsError, Label[]>> {
    logger.put(`TaskService.fetchLabels: ${this.shortTodoistSyncToken}`);
    try {
      const res = (await this.syncClient.syncAll(this.todoistSyncToken)).data;
      logger.put(
        `TaskService.fetchLabels.success: ${this.shortTodoistSyncToken}`
      );
      this.syncCloudToInstance(res);
      logger.put(
        `TaskService.fetchLabels.success (sync to local): ${this.shortTodoistSyncToken}`
      );

      return right(
        _(this.labelsById)
          .values()
          .reject((x) => x.is_deleted === 1)
          .map((x) => TodoistTaskService.toLabel(x))
          .value()
      );
    } catch (err) {
      console.error(err);
      logger.put(
        `TaskService.fetchLabels.error: ${this.shortTodoistSyncToken}`
      );
      return left(FetchLabelsError.of());
    }
  }
}
