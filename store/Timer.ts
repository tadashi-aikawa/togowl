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
import { FirestoreTimer, toTimerConfig } from '~/repository/FirebaseCloudRepository';
import { cloudRepository, projectStore } from '~/store/index';
import { ActionStatus } from '~/domain/common/ActionStatus';
import { DateTime } from '~/domain/common/DateTime';
import { createAction } from '~/utils/firestore-facade';
import { addMetaToEntry } from '~/domain/timer/service/TimerMetaService';

let service: TimerService | null;

const MAX_HISTORY_DAYS = 10;

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Timer', namespaced: true, stateFactory: true })
class TimerModule extends VuexModule {
  private _timer: FirestoreTimer | null = null;

  get timerConfig(): TimerConfig | null {
    return this._timer ? toTimerConfig(this._timer) : null;
  }

  get currentEntry(): Entry | null {
    return this._currentEntry ? addMetaToEntry(this._currentEntry, projectStore.projectById) : null;
  }

  get entries(): Entry[] {
    return Object.values(this._entryById).map(e => addMetaToEntry(e, projectStore.projectById)) ?? [];
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

  private _currentEntry: Entry | null = null;
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

  private _entryById: { [entryId: number]: Entry } = {};
  @Mutation
  setEntryById(entryById: { [entryId: number]: Entry }) {
    this._entryById = entryById;
  }

  entryByIdStatus: ActionStatus = 'init';
  @Mutation
  setEntryByIdStatus(status: ActionStatus) {
    this.entryByIdStatus = status;
  }

  entryByIdError: TogowlError | null = null;
  @Mutation
  setEntryByIdError(error: TogowlError | null) {
    this.entryByIdError = error;
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
          return right(addMetaToEntry(entry, projectStore.projectById));
        },
      ),
    );
  }

  @Action
  async completeCurrentEntry(): Promise<Either<TogowlError, Entry>> {
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
          return right(addMetaToEntry(entry, projectStore.projectById));
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
          return right(addMetaToEntry(entry, projectStore.projectById));
        },
      ),
    );
  }

  @Action
  async cancelCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
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
      await service!.deleteEntry(this.currentEntry),
      fold(
        err => {
          return left(err);
        },
        () => {
          const entry = this.currentEntry!;
          this.setCurrentEntry(null);
          return right(addMetaToEntry(entry, projectStore.projectById));
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
          return right(addMetaToEntry(entry, projectStore.projectById));
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

    this.setEntryByIdStatus('in_progress');
    pipe(
      await service!.fetchEntries(DateTime.now().minusDays(MAX_HISTORY_DAYS)),
      fold(
        err => {
          this.setEntryByIdError(err);
          this.setEntryByIdStatus('error');
        },
        entries => {
          this.setEntryById(_.keyBy(entries, x => x.id.asNumber));
          this.setEntryByIdError(null);
          this.setEntryByIdStatus('success');
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
      onInsertEntry: entry => {
        if (!this.currentEntry) {
          this.setCurrentEntry(entry);
        }
        this.setEntryById({ ...this._entryById, [entry.id.asNumber]: entry });
      },
      onUpdateEntry: entry => {
        if (this.currentEntry?.equals(entry)) {
          this.setCurrentEntry(entry.stop ? null : entry);
        }
        this.setEntryById({ ...this._entryById, [entry.id.asNumber]: entry });
      },
      onDeleteEntry: entry => {
        if (this.currentEntry?.equals(entry)) {
          this.setCurrentEntry(null);
        }
        this.setEntryById(_.omit(this._entryById, [entry.id.asNumber]));
      },
    });
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.value, '_timer', 'timer')(this.context);
    await this.updateService();
  }
}

export default TimerModule;
