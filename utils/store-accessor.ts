import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import AuthenticationModule from '~/store/Authentication';
import CloudUserModule from '~/store/CloudUser';
import NotificationModule from '~/store/Notification';

// eslint-disable-next-line import/no-mutable-exports
let authenticationStore: AuthenticationModule;
// eslint-disable-next-line import/no-mutable-exports
let userStore: CloudUserModule;
// eslint-disable-next-line import/no-mutable-exports
let notificationStore: NotificationModule;

function initialiseStores(store: Store<any>): void {
  authenticationStore = getModule(AuthenticationModule, store);
  userStore = getModule(CloudUserModule, store);
  notificationStore = getModule(NotificationModule, store);
}

export { initialiseStores, authenticationStore, userStore, notificationStore };
