import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import Authentication from '~/store/authentication';

// eslint-disable-next-line import/no-mutable-exports
let authenticationStore: Authentication;

function initialiseStores(store: Store<any>): void {
  authenticationStore = getModule(Authentication, store);
}

export { initialiseStores, authenticationStore };
