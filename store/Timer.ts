import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import _ from 'lodash';
import { UId } from '~/domain/authentication/vo/UId';
import { TogowlError } from '~/domain/common/TogowlError';
import { TimerService } from '~/domain/timer/service/TimerService';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { Either, fold, left, right } from '~/node_modules/fp-ts/lib/Either';
import { Entry } from '~/domain/timer/entity/Entry';
import { createTimerService } from '~/utils/service-factory';
import {
  FirestoreProject,
  FirestoreProjectCategory,
  FirestoreTimer,
  toProjectCategoryConfig,
  toProjectConfig,
  toTimerConfig,
} from '~/repository/FirebaseCloudRepository';
import { cloudRepository } from '~/store/index';
import { ActionStatus } from '~/domain/common/ActionStatus';
import { DateTime } from '~/domain/common/DateTime';
import { createAction } from '~/utils/firestore-facade';
import { ProjectConfig } from '~/domain/timer/vo/ProjectConfig';
import { ProjectCategoryConfig } from '~/domain/timer/vo/ProjectCategoryConfig';

let service: TimerService | null;

const MAX_HISTORY_DAYS = 10;

function addMetaToEntry(
  entry: Entry,
  projectConfig: ProjectConfig | null,
  projectCategoryConfig: ProjectCategoryConfig | null,
): Entry {
  return entry.cloneWithProject(
    entry.project?.cloneWith(
      projectConfig?.getIcon(entry.project?.id),
      entry.projectCategory?.cloneWith(projectCategoryConfig?.getIcon(entry.projectCategory?.id)),
    ),
  );
}

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Timer', namespaced: true, stateFactory: true })
class TimerModule extends VuexModule {
  private _timer: FirestoreTimer | null = null;
  private _project: FirestoreProject | null = null;
  private _projectCategory: FirestoreProjectCategory | null = null;

  get timerConfig(): TimerConfig | null {
    return this._timer ? toTimerConfig(this._timer) : null;
  }

  get projectConfig(): ProjectConfig | null {
    return this._project ? toProjectConfig(this._project) : null;
  }

  get projectCategoryConfig(): ProjectCategoryConfig | null {
    return this._projectCategory ? toProjectCategoryConfig(this._projectCategory) : null;
  }

  get currentEntry(): Entry | null {
    return this._currentEntry
      ? addMetaToEntry(this._currentEntry, this.projectConfig, this.projectCategoryConfig)
      : null;
  }

  get entries(): Entry[] {
    return this._entries?.map(e => addMetaToEntry(e, this.projectConfig, this.projectCategoryConfig)) ?? [];
  }

  get entriesWithinDay(): Entry[] {
    return _(this.entries)
      .filter(e => e.stop?.within(24 * 60 * 60) ?? false)
      .orderBy(e => e.start.unix, 'desc')
      .value();
  }

  get previousEntry(): Entry | undefined {
    return this.entriesWithinDay?.[0];
  }

  get candidatedEntries(): Entry[] {
    return _(this.entries)
      .groupBy(x => x.hashAsTask)
      .values()
      .orderBy(es => es.length, 'desc')
      .map(es => es[0])
      .value();
  }

  updateStatus: ActionStatus = 'init';
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

  _currentEntry: Entry | null = null;
  @Mutation
  setCurrentEntry(entry: Entry | null) {
    this._currentEntry = entry;
  }

  fetchingStatus: ActionStatus = 'init';
  @Mutation
  setFetchingStatus(status: ActionStatus) {
    this.fetchingStatus = status;
  }

  fetchingError: TogowlError | null = null;
  @Mutation
  setFetchingError(error: TogowlError | null) {
    this.fetchingError = error;
  }

  _entries: Entry[] | null = null;
  @Mutation
  setEntries(entries: Entry[] | null) {
    this._entries = entries;
  }

  entriesStatus: ActionStatus = 'init';
  @Mutation
  setEntriesStatus(status: ActionStatus) {
    this.entriesStatus = status;
  }

  entriesError: TogowlError | null = null;
  @Mutation
  setEntriesError(error: TogowlError | null) {
    this.entriesError = error;
  }

  @Action
  async updateTimerConfig(config: TimerConfig) {
    this.setUpdateError(null);
    this.setUpdateStatus('in_progress');

    // TODO: Recreate service?
    const err = await cloudRepository.saveTimerConfig(config);
    if (err) {
      this.setUpdateStatus('error');
      this.setUpdateError(err);
    } else {
      await this.updateService();
      this.setUpdateStatus('success');
    }
  }

  @Action
  async fetchCurrentEntry(): Promise<void> {
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      console.error('Token for timer is required! It is empty!');
      return;
    }

    this.setFetchingStatus('in_progress');
    pipe(
      await service!.fetchCurrentEntry(),
      fold(
        err => {
          this.setFetchingError(err);
          this.setCurrentEntry(null);
          this.setFetchingStatus('error');
        },
        entry => {
          this.setCurrentEntry(entry);
          this.setFetchingError(null);
          this.setFetchingStatus('success');
        },
      ),
    );
  }

  @Action
  async startEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    if (!this.timerConfig?.token) {
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    return pipe(
      await service!.startEntry(entry),
      fold(
        err => {
          this.setCurrentEntry(null);
          return left(err);
        },
        entry => {
          this.setCurrentEntry(entry);
          return right(entry);
        },
      ),
    );
  }

  @Action
  async completeCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    // TODO: Complete Todoist task and Add complete tag to toggl entry
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    if (!this.currentEntry) {
      return left(TogowlError.create('CURRENT_ENTRY_IS_EMPTY', 'Current entry is empty!'));
    }

    return pipe(
      await service!.stopEntry(this.currentEntry),
      fold(
        err => {
          return left(err);
        },
        entry => {
          this.setCurrentEntry(null);
          return right(entry);
        },
      ),
    );
  }

  @Action
  async pauseCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    // XXX: This action is similar to completeCurrentEntry but not same
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    if (!this.currentEntry) {
      return left(TogowlError.create('CURRENT_ENTRY_IS_EMPTY', 'Current entry is empty!'));
    }

    return pipe(
      await service!.stopEntry(this.currentEntry),
      fold(
        err => {
          return left(err);
        },
        entry => {
          this.setCurrentEntry(null);
          return right(entry);
        },
      ),
    );
  }

  @Action
  async connectPreviousEntry(): Promise<Either<TogowlError, Entry | null>> {
    // XXX: This action is similar to completeCurrentEntry but not same
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    if (!this.currentEntry) {
      return left(TogowlError.create('CURRENT_ENTRY_IS_EMPTY', 'Current entry is empty!'));
    }
    if (!this.previousEntry) {
      return left(TogowlError.create('PREVIOUS_ENTRY_IS_EMPTY', 'Previous entry is empty!'));
    }

    return pipe(
      await service!.updateEntry(this.currentEntry, { start: this.previousEntry.stop?.plusSeconds(1) }),
      fold(
        err => {
          return left(err);
        },
        entry => {
          this.setCurrentEntry(entry);
          return right(entry);
        },
      ),
    );
  }

  @Action
  async fetchEntries(): Promise<void> {
    // XXX: Show current tab state?
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      console.error('Token for timer is required! It is empty!');
      return;
    }

    this.setEntriesStatus('in_progress');
    pipe(
      await service!.fetchEntries(DateTime.now().minusDays(MAX_HISTORY_DAYS)),
      fold(
        err => {
          this.setEntriesError(err);
          this.setCurrentEntry(null);
          this.setEntriesStatus('error');
        },
        entries => {
          this.setEntries(entries);
          this.setEntriesError(null);
          this.setEntriesStatus('success');
        },
      ),
    );
  }

  @Action({ rawError: true })
  private async updateService(): Promise<void> {
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
      onInsertEntry: _entry => {
        this.fetchCurrentEntry();
        // TODO: Remove if partial update is implemented
        this.fetchEntries();
      },
      onUpdateEntry: _entry => {
        this.fetchCurrentEntry();
        // TODO: Remove if partial update is implemented
        this.fetchEntries();
      },
      onDeleteEntry: _entry => {
        this.fetchCurrentEntry();
        // TODO: Remove if partial update is implemented
        this.fetchEntries();
      },
      onUpdateProject: () => {
        this.fetchCurrentEntry();
        // TODO: Remove if partial update is implemented
        this.fetchEntries();
      },
    });
    this.fetchCurrentEntry();
    this.fetchEntries();
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.value, '_timer', 'timer')(this.context);
    createAction(uid.value, '_project', 'projects')(this.context);
    createAction(uid.value, '_projectCategory', 'projectCategories')(this.context);
    await this.updateService();
  }
}

export default TimerModule;
