import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import AuthenticationModule from '~/store/Authentication';
import CloudUserModule from '~/store/CloudUser';
import SlackModule from '~/store/Slack';
import TimerModule from '~/store/Timer';
import TaskModule from '~/store/Task';

// eslint-disable-next-line import/no-mutable-exports
let authenticationStore: AuthenticationModule;
// eslint-disable-next-line import/no-mutable-exports
let userStore: CloudUserModule;
// eslint-disable-next-line import/no-mutable-exports
let notificationStore: SlackModule;
// eslint-disable-next-line import/no-mutable-exports
let timerStore: TimerModule;
// eslint-disable-next-line import/no-mutable-exports
let taskStore: TaskModule;

function initialiseStores(store: Store<any>): void {
  authenticationStore = getModule(AuthenticationModule, store);
  userStore = getModule(CloudUserModule, store);
  notificationStore = getModule(SlackModule, store);
  timerStore = getModule(TimerModule, store);
  taskStore = getModule(TaskModule, store);
}

export { initialiseStores, authenticationStore, userStore, notificationStore, timerStore, taskStore };
