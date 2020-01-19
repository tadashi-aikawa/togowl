import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import _ from 'lodash';
import firebase from '~/plugins/firebase';
import { firestoreAction } from '~/node_modules/vuexfire';
import { UId } from '~/domain/authentication/vo/UId';
import { TogowlError } from '~/domain/common/TogowlError';
import { TimerService } from '~/domain/timer/service/TimerService';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { Either, fold, left, right } from '~/node_modules/fp-ts/lib/Either';
import { Entry } from '~/domain/timer/entity/Entry';
import { createTimerService } from '~/utils/service-factory';
import { FirestoreTimer } from '~/repository/FirebaseCloudRepository';
import { cloudRepository } from '~/store/index';
import { ActionStatus } from '~/domain/common/ActionStatus';
import { DateTime } from '~/domain/common/DateTime';

const firestore = firebase.firestore();
let service: TimerService | null;

const MAX_HISTORY_DAYS = 7;

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Timer', namespaced: true, stateFactory: true })
class TimerModule extends VuexModule {
  private _timer: FirestoreTimer | null = null;

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

  currentEntry: Entry | null = null;
  @Mutation
  setCurrentEntry(entry: Entry | null) {
    this.currentEntry = entry;
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

  entries: Entry[] | null = null;
  @Mutation
  setEntries(entries: Entry[] | null) {
    this.entries = entries;
  }

  get entriesWithinDay(): Entry[] {
    return _(this.entries)
      .filter(e => e.stop?.within(24 * 60 * 60) ?? false)
      .orderBy(e => e.start.unix, 'desc')
      .value();
  }

  get candidatedEntries(): Entry[] {
    const toKey = (e: Entry) => [e.description, e.project?.id, e.projectCategory?.id].join();
    return _(this.entries)
      .groupBy(toKey)
      .values()
      .orderBy(es => es.length, 'desc')
      .map(es => es[0])
      .value();
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

  get timerConfig(): TimerConfig | null {
    return TimerConfig.create(this._timer?.token, this._timer?.workspaceId, this._timer?.proxy);
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
    const action = firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('_timer', firestore.doc(`timer/${uid.value}`));
    }) as Function;

    // Call function that firebaseAction returns
    action(this.context);
    await this.updateService();
  }
}

export default TimerModule;
