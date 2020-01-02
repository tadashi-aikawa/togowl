import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import AuthenticationModule from '~/store/Authentication';
import CloudUserModule from '~/store/CloudUser';

// eslint-disable-next-line import/no-mutable-exports
let authenticationStore: AuthenticationModule;
// eslint-disable-next-line import/no-mutable-exports
let userStore: CloudUserModule;

function initialiseStores(store: Store<any>): void {
  authenticationStore = getModule(AuthenticationModule, store);
  userStore = getModule(CloudUserModule, store);
}

export { initialiseStores, authenticationStore, userStore };
