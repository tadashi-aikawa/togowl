import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from '~/plugins/firebase';
import { User } from '~/domain/authentication/vo/User';
import { UId } from '~/domain/authentication/vo/UId';
import { UserName } from '~/domain/authentication/vo/UserName';
import { MailAddress } from '~/domain/authentication/vo/MailAddress';
import { TogowlError } from '~/domain/common/TogowlError';

interface LoginPayload {
  mailAddress: MailAddress;
  password: string;
}

@Module({ name: 'authentication', namespaced: true, stateFactory: true })
class Authentication extends VuexModule {
  isLoading: boolean = false;
  error: TogowlError = TogowlError.empty();
  verifiedUser: User = User.empty();

  @Mutation
  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  @Mutation
  setError(error: TogowlError) {
    this.error = error;
  }

  @Mutation
  setVerifiedUser(user: User) {
    this.verifiedUser = user;
  }

  @Action
  async login(payload: LoginPayload) {
    this.setError(TogowlError.empty());
    this.setIsLoading(true);

    try {
      const authResult = await firebase.auth().signInWithEmailAndPassword(payload.mailAddress.value, payload.password);
      const userDoc = await firebase
        .firestore()
        .collection('users')
        .doc(authResult.user?.uid)
        .get();
      this.setVerifiedUser(
        User.create(
          UId.create(authResult.user?.uid!),
          UserName.create(userDoc.data()!.name),
          MailAddress.create(authResult.user?.email!),
        ),
      );
    } catch (err) {
      this.setError(TogowlError.create(err.code, err.message));
      this.setVerifiedUser(User.empty());
    }

    this.setIsLoading(false);
  }
}

export default Authentication;
