import { User } from '~/domain/authentication/vo/User';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import CloudRepository from '~/repository/CloudRepository';
import firebase from '~/plugins/firebase';
import { UId } from '~/domain/authentication/vo/UId';
import { UserName } from '~/domain/authentication/vo/UserName';

class FirebaseCloudRepository implements CloudRepository {
  private uid: string;

  async login(payload?: LoginPayload): Promise<Either<TogowlError, User>> {
    try {
      const user = payload
        ? (await firebase.auth().signInWithEmailAndPassword(payload.mailAddress.value, payload.password)).user
        : firebase.auth().currentUser;

      if (!user) {
        return left(TogowlError.create('NOT_USER', 'TODO: ...'));
      }

      this.uid = user.uid!;
      const userDoc = await firebase
        .firestore()
        .collection('users')
        .doc(this.uid)
        .get();
      return right(User.create(UId.create(this.uid), UserName.create(userDoc.data()!.name)));
    } catch (e) {
      return left(TogowlError.create(e.code, e.message));
    }
  }

  async logout() {
    await firebase.auth().signOut();
  }
}

export default FirebaseCloudRepository;
