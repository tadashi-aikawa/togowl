import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { TogowlError } from '~/domain/common/TogowlError';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';
import { notificationStore, timerStore, userStore, taskStore, projectStore } from '~/utils/store-accessor';
import firebase from '~/plugins/firebase';
import { UId } from '~/domain/authentication/vo/UId';
import { AuthenticationStatus } from '~/domain/authentication/vo/AuthenticationStatus';
import { cloudRepository } from '~/store/index';

async function initCloudStores(uid: UId) {
  userStore.init(uid);
  notificationStore.init(uid);
  taskStore.init(uid);
  projectStore.init(uid);
  await timerStore.init(uid);
}

@Module({ name: 'Authentication', namespaced: true, stateFactory: true })
class AuthenticationModule extends VuexModule {
  status: AuthenticationStatus = 'init';
  error: TogowlError | null = null;

  @Mutation
  setAuthenticationStatus(status: AuthenticationStatus) {
    this.status = status;
  }

  @Mutation
  setError(error: TogowlError | null) {
    this.error = error;
  }

  @Action
  init() {
    this.setAuthenticationStatus('check');
    firebase.auth().onAuthStateChanged(async user => {
      if (!user) {
        this.setError(null);
        this.setAuthenticationStatus('logout');
        return;
      }
      pipe(
        await cloudRepository.login(),
        fold(
          e => {
            this.setError(e);
            this.setAuthenticationStatus('error');
          },
          async user => {
            await initCloudStores(user.uid);
            this.setAuthenticationStatus('login');
          },
        ),
      );
    });
  }

  @Action
  async login(payload: LoginPayload) {
    this.setError(null);
    this.setAuthenticationStatus('check');

    pipe(
      await cloudRepository.login(payload),
      fold(
        e => {
          this.setError(e);
          this.setAuthenticationStatus('error');
        },
        async user => {
          await initCloudStores(user.uid);
          this.setAuthenticationStatus('login');
        },
      ),
    );
  }

  @Action
  async logout() {
    this.setAuthenticationStatus('logout');
    await cloudRepository.logout();
  }
}

export default AuthenticationModule;
