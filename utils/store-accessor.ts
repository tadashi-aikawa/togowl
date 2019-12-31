import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import Config from '~/store/config';

// eslint-disable-next-line import/no-mutable-exports
let configStore: Config;

function initialiseStores(store: Store<any>): void {
  configStore = getModule(Config, store);
}

export { initialiseStores, configStore };
