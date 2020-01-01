import { User } from '~/domain/authentication/vo/User';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import CloudRepository from '~/repository/CloudRepository';
import firebase from '~/plugins/firebase';
import { UId } from '~/domain/authentication/vo/UId';
import { UserName } from '~/domain/authentication/vo/UserName';
import { MailAddress } from '~/domain/authentication/vo/MailAddress';

class FirebaseCloudRepository implements CloudRepository {
  private uid: string;

  async login(payload: LoginPayload): Promise<Either<TogowlError, User>> {
    try {
      const authResult = await firebase.auth().signInWithEmailAndPassword(payload.mailAddress.value, payload.password);
      this.uid = authResult.user?.uid!;
      const userDoc = await firebase
        .firestore()
        .collection('users')
        .doc(this.uid)
        .get();
      const user = User.create(
        UId.create(this.uid),
        UserName.create(userDoc.data()!.name),
        MailAddress.create(authResult.user?.email!),
      );
      return right(user);
    } catch (e) {
      return left(TogowlError.create(e.code, e.message));
    }
  }
}

export default FirebaseCloudRepository;
