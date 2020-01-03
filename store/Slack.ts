import { Action, Module, VuexModule } from 'vuex-module-decorators';
import firebase from '~/plugins/firebase';
import { firestoreAction } from '~/node_modules/vuexfire';
import { UId } from '~/domain/authentication/vo/UId';
import { NotificationServiceImpl } from '~/domain/notification/service/NotificationServiceImpl';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';
import { FirestoreSlack } from '~/repository/FirebaseCloudRepository';
import { cloudRepository } from '~/store/index';

const service = new NotificationServiceImpl();
const firestore = firebase.firestore();

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Slack', namespaced: true, stateFactory: true })
class SlackModule extends VuexModule {
  _slack: FirestoreSlack | null = null;

  get slackConfig(): SlackConfig | null {
    return SlackConfig.create(this._slack?.incomingWebHookUrl, this._slack?.notifyTo);
  }

  @Action
  async updateSlackConfig(config: SlackConfig) {
    const err = await cloudRepository.saveSlackConfig(config);
    if (err) {
      // TODO: Show on UI
      console.error(err.messageForLog);
    }
  }

  @Action
  async notifyToSlack(message: string) {
    const config = this.slackConfig;
    if (!config?.incomingWebHookUrl) {
      // TODO: Show on UI
      console.error('Incoming web hook URL is required! It is empty!');
      return;
    }

    const err = await service.notifyToSlack(config.incomingWebHookUrl, message, config.notifyTo);
    if (err) {
      // TODO: Show on UI
      console.error(err.messageForLog);
    }
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
