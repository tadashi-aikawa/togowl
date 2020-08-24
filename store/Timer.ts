import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import _ from "lodash";
import { Either, left, right } from "owlelia";
import { UId } from "~/domain/authentication/vo/UId";
import { TogowlError } from "~/domain/common/TogowlError";
import { TimerService } from "~/domain/timer/service/TimerService";
import { TimerConfig } from "~/domain/timer/vo/TimerConfig";
import { Entry } from "~/domain/timer/entity/Entry";
import { createTimerService } from "~/utils/service-factory";
import {
  FirestoreRecentTask,
  FirestoreTimer,
  toRecentTask,
  toTimerConfig,
} from "~/repository/FirebaseCloudRepository";
import { cloudRepository, projectStore, taskStore } from "~/store/index";
import { ActionStatus } from "~/domain/common/ActionStatus";
import { DateTime } from "~/domain/common/DateTime";
import { createAction } from "~/utils/firestore-facade";
import { addMetaToEntry } from "~/domain/timer/service/TimerMetaService";
import { Task } from "~/domain/task/entity/Task";
import { RecentTask } from "~/domain/common/RecentTask";
import { UnexpectedError } from "~/domain/common/UnexpectedError";
import { EntryCountStorage } from "~/utils/local-storage";

let service: TimerService | null;

const MAX_HISTORY_DAYS = 14;

/**
 * Concrete implementation by using firebase
 */
@Module({ name: "Timer", namespaced: true, stateFactory: true })
class TimerModule extends VuexModule {
  private _timer: FirestoreTimer | null = null;
  private _recentTask: FirestoreRecentTask | null = null;

  get timerConfig(): TimerConfig | null {
    return this._timer ? toTimerConfig(this._timer) : null;
  }

  get recentTask(): RecentTask | null {
    return this._recentTask ? toRecentTask(this._recentTask) : null;
  }

  get currentEntry(): Entry | null {
    return this._currentEntry
      ? addMetaToEntry(this._currentEntry, projectStore.projectById)
      : null;
  }

  get taskRelatedToCurrentEntry(): Task | null {
    const id = this.recentTask?.taskId?.asNumber;
    return id ? taskStore.taskById[id] : null;
  }

  get entries(): Entry[] {
    return (
      Object.values(this._entryById).map((e) =>
        addMetaToEntry(e, projectStore.projectById)
      ) ?? []
    );
  }

  get entriesWithDayOrders(): Entry[] {
    return _(this.entries)
      .filter((e) => e.stop?.within(24 * 60 * 60) ?? false)
      .orderBy((e) => e.start.unix, "desc")
      .value();
  }

  get previousEntry(): Entry | undefined {
    return this.entriesWithDayOrders?.[0];
  }

  get candidatedEntries(): Entry[] {
    return _(this.entries)
      .uniqBy((e) => e.hashAsTask)
      .orderBy((e) => this.entrySelectedCountByHash[e.hashAsTask] ?? 0, "desc")
      .value();
  }

  updateStatus: ActionStatus = "init";
  @Mutation
  setUpdateStatus(status: ActionStatus) {
    this.updateStatus = status;
  }

  updateError: TogowlError | null = null;
  @Mutation
  setUpdateError(error: TogowlError | null) {
    this.updateError = error;
  }

  realtime: boolean = false;
  @Mutation
  setRealtime(realtime: boolean) {
    this.realtime = realtime;
  }

  private _currentEntry: Entry | null = null;
  @Mutation
  setCurrentEntry(entry: Entry | null) {
    this._currentEntry = entry;
  }

  fetchingStatus: ActionStatus = "init";
  @Mutation
  setFetchingStatus(status: ActionStatus) {
    this.fetchingStatus = status;
  }

  fetchingError: TogowlError | null = null;
  @Mutation
  setFetchingError(error: TogowlError | null) {
    this.fetchingError = error;
  }

  private _entryById: { [entryId: number]: Entry } = {};
  @Mutation
  setEntryById(entryById: { [entryId: number]: Entry }) {
    this._entryById = entryById;
  }

  entryByIdStatus: ActionStatus = "init";
  @Mutation
  setEntryByIdStatus(status: ActionStatus) {
    this.entryByIdStatus = status;
  }

  entryByIdError: TogowlError | null = null;
  @Mutation
  setEntryByIdError(error: TogowlError | null) {
    this.entryByIdError = error;
  }

  private entrySelectedCountByHash: {
    [hash: string]: number;
  } = EntryCountStorage.getAll();

  @Mutation
  setEntrySelectedCountByHash(countByHash: { [hash: string]: number }) {
    this.entrySelectedCountByHash = countByHash;
  }

  @Action
  async updateTimerConfig(config: TimerConfig) {
    this.setUpdateError(null);
    this.setUpdateStatus("in_progress");

    // TODO: Recreate service?
    const err = await cloudRepository.saveTimerConfig(config);
    if (err) {
      this.setUpdateStatus("error");
      this.setUpdateError(err);
    } else {
      await this.updateService();
      this.setUpdateStatus("success");
    }
  }

  @Action
  async fetchCurrentEntry(): Promise<void> {
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      console.error("Token for timer is required! It is empty!");
      return;
    }

    this.setFetchingStatus("in_progress");
    const currentEntryOrErr = await service!.fetchCurrentEntry();
    if (currentEntryOrErr.isLeft()) {
      this.setFetchingError(currentEntryOrErr.error);
      this.setCurrentEntry(null);
      this.setFetchingStatus("error");
      return;
    }

    this.setCurrentEntry(currentEntryOrErr.value);
    this.setFetchingError(null);
    this.setFetchingStatus("success");
  }

  @Action
  async startEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    const entryOrErr = await service!.startEntry(
      entry.description,
      entry.project
    );
    if (entryOrErr.isLeft()) {
      this.setCurrentEntry(null);
      return left(entryOrErr.error);
    }

    this.setCurrentEntry(entryOrErr.value);
    return right(addMetaToEntry(entryOrErr.value, projectStore.projectById));
  }

  @Action
  async startEntryByTask(task: Task): Promise<Either<TogowlError, Entry>> {
    const entryOrErr = await service!.startEntry(
      task.titleWithoutDecorated,
      task.entryProject
    );
    if (entryOrErr.isLeft()) {
      this.setCurrentEntry(null);
      return left(entryOrErr.error);
    }

    this.setCurrentEntry(entryOrErr.value);
    // Not use await because prioritize speed over certainty
    cloudRepository
      .saveRecentTask(
        RecentTask.of({
          taskId: task.id,
          entryId: entryOrErr.value.id,
        })
      )
      .then((e) => e && console.error(e));
    return right(addMetaToEntry(entryOrErr.value, projectStore.projectById));
  }

  @Action
  async completeCurrentEntry(): Promise<Either<TogowlError, Entry>> {
    // TODO: Complete Todoist task and Add complete tag to toggl entry
    if (!this.currentEntry) {
      return Promise.resolve(
        left(
          UnexpectedError.of({
            detail: "Fail trying to complete a current task but it is empty",
          })
        )
      );
    }

    const entryOrErr = await service!.stopEntry(this.currentEntry);
    if (entryOrErr.isLeft()) {
      return left(entryOrErr.error);
    }

    this.setCurrentEntry(null);
    if (
      this.recentTask?.taskId &&
      this.recentTask?.entryId?.equals(entryOrErr.value.id)
    ) {
      // Not use await because prioritize speed over certainty
      taskStore.completeTask(this.recentTask?.taskId);
    }

    // Not use await because prioritize speed over certainty
    cloudRepository
      .saveRecentTask(RecentTask.empty())
      .then((e) => e && console.error(e));

    return right(addMetaToEntry(entryOrErr.value, projectStore.projectById));
  }

  @Action
  async pauseCurrentEntry(): Promise<Either<TogowlError, Entry>> {
    // XXX: This action is similar to completeCurrentEntry but not same
    if (!this.currentEntry) {
      return Promise.resolve(
        left(
          UnexpectedError.of({
            detail: "Fail trying to pause a current task but it is empty",
          })
        )
      );
    }

    const entryOrErr = await service!.stopEntry(this.currentEntry);
    if (entryOrErr.isLeft()) {
      return left(entryOrErr.error);
    }

    this.setCurrentEntry(null);
    // Not use await because prioritize speed over certainty
    cloudRepository
      .saveRecentTask(RecentTask.empty())
      .then((e) => e && console.log(e));

    return right(addMetaToEntry(entryOrErr.value, projectStore.projectById));
  }

  @Action
  async cancelCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    // XXX: This action is similar to completeCurrentEntry but not same
    if (!this.currentEntry) {
      return Promise.resolve(
        left(
          UnexpectedError.of({
            detail: "Fail trying to cancel a current task but it is empty",
          })
        )
      );
    }

    const entryOrErr = await service!.deleteEntry(this.currentEntry);
    if (entryOrErr.isLeft()) {
      return left(entryOrErr.error);
    }

    this.setCurrentEntry(null);
    // Not use await because prioritize speed over certainty
    cloudRepository
      .saveRecentTask(RecentTask.empty())
      .then((e) => e && console.error(e));

    return right(addMetaToEntry(entryOrErr.value, projectStore.projectById));
  }

  @Action
  connectPreviousEntry(): Promise<Either<TogowlError, Entry | null>> {
    // XXX: This action is similar to completeCurrentEntry but not same
    if (!this.currentEntry) {
      return Promise.resolve(
        left(
          UnexpectedError.of({
            detail:
              "Fail trying to connect with a previous task but current is empty",
          })
        )
      );
    }
    if (!this.previousEntry) {
      return Promise.resolve(
        left(
          UnexpectedError.of({
            detail:
              "Fail trying to connect with a previous task but it is empty",
          })
        )
      );
    }

    return service!
      .updateEntry(this.currentEntry, {
        start: this.previousEntry.stop?.plusSeconds(1),
      })
      .then((e) =>
        e.mapRight((entry) => {
          this.setCurrentEntry(entry);
          return addMetaToEntry(entry, projectStore.projectById);
        })
      );
  }

  @Action
  async fetchEntries(): Promise<void> {
    this.setEntryByIdStatus("in_progress");
    const entriesOrErr = await service!.fetchEntries(
      DateTime.now().minusDays(MAX_HISTORY_DAYS)
    );
    if (entriesOrErr.isLeft()) {
      this.setEntryByIdError(entriesOrErr.error);
      this.setEntryByIdStatus("error");
      return;
    }

    this.setEntryById(_.keyBy(entriesOrErr.value, (x) => x.id.asNumber));
    this.setEntryByIdError(null);
    this.setEntryByIdStatus("success");
  }

  @Action({ rawError: true })
  increaseEntrySelectedCount(entry: Entry): void {
    this.setEntrySelectedCountByHash(
      EntryCountStorage.increase(entry.hashAsTask)
    );
  }

  @Action({ rawError: true })
  async updateService(): Promise<void> {
    if (service) {
      service.terminate();
    }

    service = await createTimerService({
      onStartSubscribe: () => {
        this.setRealtime(true);
        this.fetchCurrentEntry();
        this.fetchEntries();
      },
      onEndSubscribe: async () => {
        this.setRealtime(false);
        await this.updateService();
      },
      onError: this.setFetchingError,
      onInsertEntry: (entry) => {
        if (!this.currentEntry) {
          this.setCurrentEntry(entry);
        }
        this.setEntryById({ ...this._entryById, [entry.id.asNumber]: entry });
      },
      onUpdateEntry: (entry) => {
        if (this.currentEntry?.equals(entry)) {
          this.setCurrentEntry(entry.stop ? null : entry);
        }
        this.setEntryById({ ...this._entryById, [entry.id.asNumber]: entry });
      },
      onDeleteEntry: (entry) => {
        if (this.currentEntry?.equals(entry)) {
          this.setCurrentEntry(null);
        }
        this.setEntryById(_.omit(this._entryById, [entry.id.asNumber]));
      },
    });
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.unwrap(), "_timer", "timer")(this.context);
    createAction(uid.unwrap(), "_recentTask", "recentTask")(this.context);
    await this.updateService();
  }
}

export default TimerModule;
