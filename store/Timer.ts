import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import firebase from '~/plugins/firebase';
import { firestoreAction } from '~/node_modules/vuexfire';
import { UId } from '~/domain/authentication/vo/UId';
import { TogowlError } from '~/domain/common/TogowlError';
import { TimerService } from '~/domain/timer/service/TimerService';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';
import { Entry } from '~/domain/timer/vo/Entry';
import { createTimerService } from '~/utils/service-factory';
import { FirestoreTimer } from '~/repository/FirebaseCloudRepository';
import { cloudRepository } from '~/store/index';
import { UpdateStatus } from '~/domain/notification/vo/UpdateStatus';

const firestore = firebase.firestore();
let service: TimerService | null;

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Timer', namespaced: true, stateFactory: true })
class TimerModule extends VuexModule {
  _timer: FirestoreTimer | null = null;
  updateStatus: UpdateStatus = 'init';
  updateError: TogowlError | null = null;

  currentEntry: Entry | null = null;
  error: TogowlError | null = null;

  get timerConfig(): TimerConfig | null {
    return TimerConfig.create(this._timer?.token, this._timer?.proxy);
  }

  @Mutation
  setCurrentEntry(entry: Entry | null) {
    this.currentEntry = entry;
  }

  @Mutation
  setError(error: TogowlError | null) {
    this.error = error;
  }

  @Mutation
  setUpdateStatus(status: UpdateStatus) {
    this.updateStatus = status;
  }

  @Mutation
  setUpdateError(error: TogowlError | null) {
    this.updateError = error;
  }

  @Action
  async updateTimerConfig(config: TimerConfig) {
    this.setUpdateError(null);
    this.setUpdateStatus('updating');

    const err = await cloudRepository.saveTimerConfig(config);
    if (err) {
      this.setUpdateStatus('error');
      this.setUpdateError(err);
    } else {
      this.setUpdateStatus('success');
    }
  }

  @Action
  async fetchCurrentEntry() {
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      console.error('Token for timer is required! It is empty!');
      return;
    }

    pipe(
      await service!.fetchCurrentEntry(),
      fold(
        err => {
          this.setError(err);
          this.setCurrentEntry(null);
        },
        entry => {
          this.setCurrentEntry(entry);
          this.setError(null);
        },
      ),
    );
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    service = await createTimerService({
      onStartSubscribe: () => this.fetchCurrentEntry(),
      onEndSubscribe: () => console.log('end subscribe'),
      onError: this.setError,
      onInsertEntry: _entry => this.fetchCurrentEntry(),
      onUpdateEntry: _entry => this.fetchCurrentEntry(),
      onDeleteEntry: _entry => this.fetchCurrentEntry(),
    });

    const action = firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('_timer', firestore.doc(`timer/${uid.value}`));
    }) as Function;

    // Call function that firebaseAction returns
    return action(this.context);
  }
}

export default TimerModule;
