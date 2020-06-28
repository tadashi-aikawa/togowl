import { Store } from "vuex";
import { getModule } from "vuex-module-decorators";
import AuthenticationModule from "~/store/Authentication";
import CloudUserModule from "~/store/CloudUser";
import SlackModule from "~/store/Slack";
import TimerModule from "~/store/Timer";
import TaskModule from "~/store/Task";
import ProjectModule from "~/store/Project";
import AppModule from "~/store/App";

// eslint-disable-next-line import/no-mutable-exports
let appStore: AppModule;
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
// eslint-disable-next-line import/no-mutable-exports
let projectStore: ProjectModule;

function initialiseStores(store: Store<any>): void {
  appStore = getModule(AppModule, store);
  authenticationStore = getModule(AuthenticationModule, store);
  userStore = getModule(CloudUserModule, store);
  notificationStore = getModule(SlackModule, store);
  timerStore = getModule(TimerModule, store);
  taskStore = getModule(TaskModule, store);
  projectStore = getModule(ProjectModule, store);
}

export {
  initialiseStores,
  appStore,
  authenticationStore,
  userStore,
  notificationStore,
  timerStore,
  taskStore,
  projectStore,
};
