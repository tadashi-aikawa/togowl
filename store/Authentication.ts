import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { TogowlError } from '~/domain/common/TogowlError';
import CloudRepository from '~/repository/CloudRepository';
import FirebaseCloudRepository from '~/repository/FirebaseCloudRepository';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';
import { userStore } from '~/utils/store-accessor';

@Module({ name: 'Authentication', namespaced: true, stateFactory: true })
class AuthenticationModule extends VuexModule {
  // TODO: status enum (AUTHENTICATING / SUCCESS / FAILURE / NONE)
  duringAuthentication: boolean = false;
  error: TogowlError | null = null;
  cloudRepository: CloudRepository = new FirebaseCloudRepository();

  @Mutation
  setDuringAuthentication(isLoading: boolean) {
    this.duringAuthentication = isLoading;
  }

  @Mutation
  setError(error: TogowlError | null) {
    this.error = error;
  }

  @Action
  async login(payload: LoginPayload) {
    this.setError(null);
    this.setDuringAuthentication(true);

    pipe(
      await this.cloudRepository.login(payload),
      fold(
        e => this.setError(e),
        user => userStore.init(user.uid),
      ),
    );

    this.setDuringAuthentication(false);
  }
}

export default AuthenticationModule;
