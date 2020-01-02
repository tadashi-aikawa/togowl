import { Store } from 'vuex';
import { initialiseStores } from '~/utils/store-accessor';
import { vuexfireMutations } from '~/node_modules/vuexfire';

const initializer = (store: Store<any>) => initialiseStores(store);
export const plugins = [initializer];

// Vuexfire mutations should be in root
export const mutations = { ...vuexfireMutations };

export * from '~/utils/store-accessor';
