import _ from 'lodash';
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
import { Icon } from '~/domain/common/Icon';
import { ProjectConfig } from '~/domain/timer/vo/ProjectConfig';
import { ProjectCategoryConfig } from '~/domain/timer/vo/ProjectCategoryConfig';

export interface FirestoreSlack {
  notifyTo?: string;
  incomingWebHookUrl?: string;
  proxy?: string;
}

export interface FirestoreTimer {
  token?: string;
  workspaceId?: number;
  proxy?: string;
}

export interface FirestoreProject {
  [projectId: string]: {
    icon?: {
      url?: string;
      emoji?: string;
    };
  };
}

export interface FirestoreProjectCategory {
  [projectCategoryId: string]: {
    icon?: {
      url?: string;
      emoji?: string;
    };
  };
}

export function toProjectConfig(data: FirestoreProject): ProjectConfig {
  return ProjectConfig.create(
    _.mapValues(data, meta => ({
      icon: meta.icon ? Icon.create(meta.icon) : undefined,
    })),
  );
}

export function toProjectCategoryConfig(data: FirestoreProjectCategory): ProjectCategoryConfig {
  return ProjectCategoryConfig.create(
    _.mapValues(data, meta => ({
      icon: meta.icon ? Icon.create(meta.icon) : undefined,
    })),
  );
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
      proxy: config.proxy,
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

  saveTimerConfig(config: TimerConfig): Promise<TogowlError | null> {
    const document: FirestoreTimer = {
      token: config.token,
      workspaceId: config.workspaceId,
      proxy: config.proxy,
    };
    return firebase
      .firestore()
      .collection('timer')
      .doc(this.uid)
      .set(document)
      .then(() => {
        return null;
      })
      .catch(err => TogowlError.create('SAVE_TIMER_CONFIG_ERROR', 'Fail to save timer config.', err));
  }

  loadTimerConfig(): Promise<Either<TogowlError, TimerConfig>> {
    return firebase
      .firestore()
      .collection('timer')
      .doc(this.uid)
      .get()
      .then(x => {
        const data = x.data() as FirestoreTimer;
        // TODO: refactoring (integrate to outer)
        return data
          ? right(TimerConfig.create(data.token, data.workspaceId, data.proxy))
          : left(TogowlError.create('GET_TIMER_CONFIG_ERROR', 'Empty timer config.'));
      })
      .catch(err => left(TogowlError.create('GET_TIMER_CONFIG_ERROR', 'Fail to get timer config.', err)));
  }

  loadProjectConfig(): Promise<Either<TogowlError, ProjectConfig>> {
    return firebase
      .firestore()
      .collection('projects')
      .doc(this.uid)
      .get()
      .then(x => {
        const data = x.data() as FirestoreProject;
        // TODO: Refactoring (Meta.create?)
        return data
          ? right(toProjectConfig(data))
          : left(TogowlError.create('GET_PROJECT_CONFIG_ERROR', 'Empty project config.'));
      })
      .catch(err => left(TogowlError.create('GET_PROJECT_CONFIG_ERROR', 'Fail to get project config.', err)));
  }

  loadProjectCategoryConfig(): Promise<Either<TogowlError, ProjectCategoryConfig>> {
    return firebase
      .firestore()
      .collection('projectCategories')
      .doc(this.uid)
      .get()
      .then(x => {
        const data = x.data() as FirestoreProjectCategory;
        // TODO: Refactoring (Meta.create?)
        return data
          ? right(toProjectCategoryConfig(data))
          : left(TogowlError.create('GET_PROJECT_CATEGORY_CONFIG_ERROR', 'Empty project category config.'));
      })
      .catch(err =>
        left(TogowlError.create('GET_PROJECT_CATEGORY_CONFIG_ERROR', 'Fail to get project category config.', err)),
      );
  }
}

export default FirebaseCloudRepository;
