import { firestoreAction } from '~/node_modules/vuexfire';
import firebase from '~/plugins/firebase';

export const store = firebase.firestore();

export function createAction(uid: string, key: string, resourceName: string): Function {
  return firestoreAction(({ bindFirestoreRef }) => {
    return bindFirestoreRef(key, store.doc(`${resourceName}/${uid}`));
  }) as Function;
}
