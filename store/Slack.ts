import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import firebase from '~/plugins/firebase';
import { firestoreAction } from '~/node_modules/vuexfire';
import { UId } from '~/domain/authentication/vo/UId';
import { NotificationServiceImpl } from '~/domain/notification/service/NotificationServiceImpl';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';
import { FirestoreSlack } from '~/repository/FirebaseCloudRepository';
import { cloudRepository } from '~/store/index';
import { UpdateStatus } from '~/domain/notification/vo/UpdateStatus';
import { TogowlError } from '~/domain/common/TogowlError';

const service = new NotificationServiceImpl();
const firestore = firebase.firestore();

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Slack', namespaced: true, stateFactory: true })
class SlackModule extends VuexModule {
  _slack: FirestoreSlack | null = null;
  updateStatus: UpdateStatus = 'init';
  updateError: TogowlError | null = null;

  get slackConfig(): SlackConfig | null {
    return SlackConfig.create(this._slack?.incomingWebHookUrl, this._slack?.notifyTo, this._slack?.proxy);
  }

  @Mutation
  setUpdateStatus(status: UpdateStatus) {
    this.updateStatus = status;
  }

  @Mutation
  setUpdateError(error: TogowlError | null) {
    this.updateError = error;
  }

  @Action
  async updateSlackConfig(config: SlackConfig) {
    this.setUpdateError(null);
    this.setUpdateStatus('updating');

    const err = await cloudRepository.saveSlackConfig(config);
    if (err) {
      this.setUpdateStatus('error');
      this.setUpdateError(err);
    } else {
      this.setUpdateStatus('success');
    }
  }

  @Action
  async notifyToSlack(message: string): Promise<TogowlError | null> {
    const config = this.slackConfig;
    if (!config?.incomingWebHookUrl) {
      return TogowlError.create('INCOMING_WEB_HOOK_URL_IS_EMPTY', 'Incoming web hook URL is required! It is empty!');
    }

    const err = await service.notifyToSlack(config.incomingWebHookUrl, message, config.notifyTo, config.proxy);
    if (err) {
      console.error(err.messageForLog);
      return TogowlError.create(err.code, err.message);
    }

    return null;
  }

  @Action({ rawError: true })
  init(uid: UId) {
    const action = firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('_slack', firestore.doc(`slack/${uid.value}`));
    }) as Function;

    // Call function that firebaseAction returns
    return action(this.context);
  }
}

export default SlackModule;
