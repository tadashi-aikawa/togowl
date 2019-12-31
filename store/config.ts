import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from '~/plugins/firebase';
import { TogowlError } from '~/domain/common/vo';
import { LoginPayload, MailAddress } from '~/domain/authentication/vo';

@Module({ name: 'config', namespaced: true, stateFactory: true })
class Config extends VuexModule {
  error: TogowlError = TogowlError.empty();
  verifiedMailAddress: MailAddress = MailAddress.empty();

  @Mutation
  setError(error: TogowlError) {
    this.error = error;
  }

  @Mutation
  setVerifiedMailAddress(mailAddress: MailAddress) {
    this.verifiedMailAddress = mailAddress;
  }

  @Action
  async login(payload: LoginPayload) {
    try {
      const ret = await firebase.auth().signInWithEmailAndPassword(payload.mailAddress.value, payload.password);
      this.setVerifiedMailAddress(MailAddress.create(ret.user?.email!));
    } catch (err) {
      this.setError(new TogowlError(err.code, err.message));
      this.setVerifiedMailAddress(MailAddress.empty());
    }
  }
}

export default Config;
