import { User } from '~/domain/authentication/vo/User';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import CloudRepository from '~/repository/CloudRepository';
import firebase from '~/plugins/firebase';
import { UId } from '~/domain/authentication/vo/UId';
import { UserName } from '~/domain/authentication/vo/UserName';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';

export interface FirestoreSlack {
  notifyTo?: string;
  incomingWebHookUrl?: string;
}

export interface FirestoreTimer {
  token?: string;
  proxy?: string;
}

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

  saveSlackConfig(config: SlackConfig): Promise<TogowlError | null> {
    const document: FirestoreSlack = {
      incomingWebHookUrl: config.incomingWebHookUrl?.value,
      notifyTo: config.notifyTo?.value,
    };
    return firebase
      .firestore()
      .collection('slack')
      .doc(this.uid)
      .set(document)
      .then(() => {
        return null;
      })
      .catch(err => TogowlError.create('SAVE_SLACK_CONFIG_ERROR', 'Fail to save slack config.', err));
  }

  getTimerConfig(): Promise<Either<TogowlError, TimerConfig>> {
    return firebase
      .firestore()
      .collection('timer')
      .doc(this.uid)
      .get()
      .then(x => {
        const data = x.data() as FirestoreTimer;
        return data
          ? right(TimerConfig.create(data.token, data.proxy))
          : left(TogowlError.create('GET_TIMER_CONFIG_ERROR', 'Empty timer config.'));
      })
      .catch(err => left(TogowlError.create('GET_TIMER_CONFIG_ERROR', 'Fail to get timer config.', err)));
  }
}

export default FirebaseCloudRepository;
