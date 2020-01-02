import { Action, Module, VuexModule } from 'vuex-module-decorators';
import { User } from '~/domain/authentication/vo/User';
import firebase from '~/plugins/firebase';
import { firestoreAction } from '~/node_modules/vuexfire';
import { UId } from '~/domain/authentication/vo/UId';
import { UserName } from '~/domain/authentication/vo/UserName';

const firestore = firebase.firestore();

interface FirestoreUser {
  id: string;
  name: string;
}

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'CloudUser', namespaced: true, stateFactory: true })
class CloudUserModule extends VuexModule {
  _user: FirestoreUser | null = null;

  get user(): User | null {
    return this._user ? User.create(UId.create(this._user.id), UserName.create(this._user.name)) : null;
  }

  @Action({ rawError: true })
  init(uid: UId) {
    const action = firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('_user', firestore.doc(`users/${uid.value}`));
    }) as Function;

    // Call function that firebaseAction returns
    return action(this.context);
  }
}

export default CloudUserModule;
