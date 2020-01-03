import { Action, Module, VuexModule } from 'vuex-module-decorators';
import firebase from '~/plugins/firebase';
import { firestoreAction } from '~/node_modules/vuexfire';
import { UId } from '~/domain/authentication/vo/UId';
import * as slack from '~/external/slack';

const firestore = firebase.firestore();

interface FirestoreNotificationConfig {
  slack?: {
    notifyTo?: string;
    incomingWebHookUrl?: string;
  };
}

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Notification', namespaced: true, stateFactory: true })
class NotificationModule extends VuexModule {
  _notificationConfig: FirestoreNotificationConfig | null = null;

  @Action
  async notifyToSlack(message: string) {
    if (!this._notificationConfig?.slack?.incomingWebHookUrl) {
      console.error('Incoming web hook URL is required! It is empty!');
      return;
    }
    await slack.send(
      this._notificationConfig?.slack?.incomingWebHookUrl,
      message,
      this._notificationConfig.slack.notifyTo,
    );
  }

  @Action({ rawError: true })
  init(uid: UId) {
    const action = firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('_notificationConfig', firestore.doc(`notification-config/${uid.value}`));
    }) as Function;

    // Call function that firebaseAction returns
    return action(this.context);
  }
}

export default NotificationModule;
