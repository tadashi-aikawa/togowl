import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import AuthenticationModule from '~/store/Authentication';
import CloudUserModule from '~/store/CloudUser';
import SlackModule from '~/store/Slack';
import TimerModule from '~/store/Timer';

// eslint-disable-next-line import/no-mutable-exports
let authenticationStore: AuthenticationModule;
// eslint-disable-next-line import/no-mutable-exports
let userStore: CloudUserModule;
// eslint-disable-next-line import/no-mutable-exports
let notificationStore: SlackModule;
// eslint-disable-next-line import/no-mutable-exports
let timerStore: TimerModule;

function initialiseStores(store: Store<any>): void {
  authenticationStore = getModule(AuthenticationModule, store);
  userStore = getModule(CloudUserModule, store);
  notificationStore = getModule(SlackModule, store);
  timerStore = getModule(TimerModule, store);
}

export { initialiseStores, authenticationStore, userStore, notificationStore, timerStore };
