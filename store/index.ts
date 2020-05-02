import { Store } from "vuex";
import { initialiseStores } from "~/utils/store-accessor";
import { vuexfireMutations } from "~/node_modules/vuexfire";
import CloudRepository from "~/repository/CloudRepository";
import FirebaseCloudRepository from "~/repository/FirebaseCloudRepository";

const initializer = (store: Store<any>) => initialiseStores(store);
export const plugins = [initializer];

// Vuexfire mutations should be in root
export const mutations = { ...vuexfireMutations };

export * from "~/utils/store-accessor";

// XXX: Should I be in here?? (plugin??)
export const cloudRepository: CloudRepository = new FirebaseCloudRepository();
