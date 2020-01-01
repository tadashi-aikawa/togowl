import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from '~/plugins/firebase';
import { User } from '~/domain/authentication/vo/User';
import { UId } from '~/domain/authentication/vo/UId';
import { UserName } from '~/domain/authentication/vo/UserName';
import { MailAddress } from '~/domain/authentication/vo/MailAddress';
import { TogowlError } from '~/domain/common/TogowlError';
import CloudRepository from '~/repository/CloudRepository';
import FirebaseCloudRepository from '~/repository/FirebaseCloudRepository';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';

@Module({ name: 'authentication', namespaced: true, stateFactory: true })
class Authentication extends VuexModule {
  isLoading: boolean = false;
  error: TogowlError = TogowlError.empty();
  verifiedUser: User = User.empty();
  cloudRepository: CloudRepository = new FirebaseCloudRepository();

  @Mutation
  setLoading(isLoading: boolean) {
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
    this.setLoading(true);

    pipe(
      await this.cloudRepository.login(payload),
      fold(
        e => {
          this.setError(e);
          this.setVerifiedUser(User.empty());
        },
        user => {
          this.setVerifiedUser(user);
        },
      ),
    );

    this.setLoading(false);
  }
}

export default Authentication;
