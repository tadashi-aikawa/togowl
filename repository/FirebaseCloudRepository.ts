import _ from "lodash";
import { Either, left, right } from "owlelia";
import { User } from "~/domain/authentication/vo/User";
import { LoginPayload } from "~/domain/authentication/vo/LoginPayload";
import CloudRepository from "~/repository/CloudRepository";
import firebase from "~/plugins/firebase";
import { UId } from "~/domain/authentication/vo/UId";
import { UserName } from "~/domain/authentication/vo/UserName";
import { SlackConfig } from "~/domain/notification/vo/SlackConfig";
import { TimerConfig } from "~/domain/timer/vo/TimerConfig";
import { Icon } from "~/domain/common/Icon";
import { ProjectConfig } from "~/domain/timer/vo/ProjectConfig";
import { ProjectCategoryConfig } from "~/domain/timer/vo/ProjectCategoryConfig";
import { store } from "~/utils/firestore-facade";
import { TaskConfig } from "~/domain/task/vo/TaskConfig";
import { ProjectId as TaskProjectId } from "~/domain/task/vo/ProjectId";
import { TaskId } from "~/domain/task/vo/TaskId";
import { RecentTask } from "~/domain/common/RecentTask";
import { EntryId } from "~/domain/timer/vo/EntryId";
import { Url } from "~/domain/common/Url";
import { ChannelName } from "~/domain/notification/vo/ChannelName";
import {
  LoadProjectCategoryConfigError,
  LoadProjectConfigError,
  LoadSlackConfigError,
  LoadTaskConfigError,
  LoadAppConfigError,
  LoadTimerConfigError,
  LoadUserError,
  LoginError,
  SaveProjectCategoryConfigError,
  SaveProjectConfigError,
  SaveRecentTaskError,
  SaveSlackConfigError,
  SaveTaskConfigError,
  SaveAppConfigError,
  SaveTimerConfigError,
} from "~/repository/firebase-errors";
import { Color } from "~/domain/common/Color";
import { Theme } from "~/domain/app/vo/Theme";
import { AppConfig } from "~/domain/app/vo/AppConfig";

export interface FirestoreRecentTask {
  taskId?: string;
  entryId?: string;
}

export interface FirestoreSlack {
  notifyTo?: string;
  incomingWebHookUrl?: string;
  proxy?: string;
  disabled?: boolean;
}

export interface FirestoreTask {
  token?: string;
  syncToken?: string;
}

export interface FirestoreTimer {
  token?: string;
  workspaceId?: number;
  proxy?: string;
}

export interface FirestoreAppConfig {
  theme: {
    taskBackgroundImageUrl?: string;
  };
}

export interface FirestoreProject {
  [projectId: string]: {
    icon?: {
      url?: string;
      emoji?: string;
    };
    taskProjectIds?: string[];
  };
}

export interface FirestoreProjectCategory {
  [projectCategoryId: string]: {
    icon?: {
      url?: string;
      emoji?: string;
    };
    color?: string;
  };
}

export function toRecentTask(data: FirestoreRecentTask): RecentTask {
  return RecentTask.of({
    taskId: data.taskId ? TaskId.of(data.taskId) : undefined,
    entryId: data.entryId ? EntryId.of(data.entryId) : undefined,
  });
}

export function fromRecentTask(recentTask: RecentTask): FirestoreRecentTask {
  return {
    taskId: recentTask.taskId?.unwrap() ?? "",
    entryId: recentTask.entryId?.unwrap() ?? "",
  };
}

export function toTaskConfig(data: FirestoreTask): TaskConfig {
  return TaskConfig.of({
    token: data.token,
    syncToken: data.syncToken,
  });
}

export function fromTaskConfig(config: TaskConfig): FirestoreTask {
  return {
    token: config.token ?? "",
    syncToken: config.syncToken ?? "",
  };
}

export function toTimerConfig(data: FirestoreTimer): TimerConfig {
  return TimerConfig.of({
    token: data.token,
    workspaceId: data.workspaceId,
    proxy: data.proxy,
  });
}

export function toSlackConfig(data: FirestoreSlack): SlackConfig {
  return SlackConfig.of({
    incomingWebHookUrl: data.incomingWebHookUrl
      ? Url.try(data.incomingWebHookUrl).orThrow()
      : undefined,
    notifyTo: data.notifyTo
      ? ChannelName.try(data.notifyTo).orThrow()
      : undefined,
    proxy: data.proxy,
    disabled: data.disabled ?? false,
  });
}

export function toAppConfig(data: FirestoreAppConfig): AppConfig {
  return AppConfig.of({
    theme: Theme.of({
      taskBackgroundImageUrl: data.theme.taskBackgroundImageUrl
        ? Url.try(data.theme.taskBackgroundImageUrl).orThrow()
        : undefined,
    }),
  });
}

export function fromAppConfig(config: AppConfig): FirestoreAppConfig {
  return {
    theme: {
      taskBackgroundImageUrl: config.theme.taskBackgroundImageUrl ?? "",
    },
  };
}

export function toProjectConfig(data: FirestoreProject): ProjectConfig {
  return ProjectConfig.of(
    _.mapValues(data, (meta) => ({
      icon: meta.icon
        ? Icon.of({
            url: meta.icon.url ? Url.try(meta.icon.url).orThrow() : undefined,
            emoji: meta.icon.emoji,
          })
        : undefined,
      taskProjectIds: meta.taskProjectIds
        ? meta.taskProjectIds.map(TaskProjectId.of)
        : [],
    }))
  );
}

export function fromProjectConfig(config: ProjectConfig): FirestoreProject {
  return _.mapValues(config.unwrap(), (meta) => ({
    icon: {
      url: meta.icon?.url ?? "",
      emoji: meta.icon?.emoji ?? "",
    },
    taskProjectIds: meta.taskProjectIds.map((x) => x.unwrap()),
  }));
}

export function toProjectCategoryConfig(
  data: FirestoreProjectCategory
): ProjectCategoryConfig {
  return ProjectCategoryConfig.of(
    _.mapValues(data, (meta) => ({
      icon: meta.icon
        ? Icon.of({
            url: meta.icon.url ? Url.try(meta.icon.url).orThrow() : undefined,
            emoji: meta.icon.emoji,
          })
        : undefined,
      color: meta.color ? Color.of(meta.color) : undefined,
    }))
  );
}

export function fromProjectCategoryConfig(
  config: ProjectCategoryConfig
): FirestoreProjectCategory {
  return _.mapValues(config.unwrap(), (meta) => ({
    icon: {
      url: meta.icon?.url ?? "",
      emoji: meta.icon?.emoji ?? "",
    },
    color: meta.color?.unwrap() ?? "",
  }));
}

class FirebaseCloudRepository implements CloudRepository {
  private uid: string;

  async login(payload?: LoginPayload): Promise<Either<LoginError, User>> {
    try {
      const user = payload
        ? (
            await firebase
              .auth()
              .signInWithEmailAndPassword(
                payload.mailAddress.unwrap(),
                payload.password
              )
          ).user
        : firebase.auth().currentUser;

      if (!user) {
        return left(
          LoginError.of({
            detail: `No user matched with email-address, ${payload?.mailAddress?.unwrap()}`,
          })
        );
      }

      this.uid = user.uid!;
      const userDoc = await store.collection("users").doc(this.uid).get();
      // Databaseにユーザ登録をしていないと、userDoc.data()はnullになる
      return right(
        User.of({
          uid: UId.of(this.uid),
          name: UserName.of(userDoc.data()!.name),
        })
      );
    } catch (e) {
      return left(
        LoginError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
    }
  }

  async loadUser(userId: UId): Promise<Either<LoadUserError, User>> {
    try {
      this.uid = userId.unwrap();
      const userDoc = await store.collection("users").doc(this.uid).get();
      // Databaseにユーザ登録をしていないと、userDoc.data()はnullになる
      return right(
        User.of({
          uid: UId.of(this.uid),
          name: UserName.of(userDoc.data()!.name),
        })
      );
    } catch (e) {
      return left(
        LoadUserError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
    }
  }

  async logout() {
    await firebase.auth().signOut();
  }

  saveSlackConfig(config: SlackConfig): Promise<SaveSlackConfigError | null> {
    const document: FirestoreSlack = {
      incomingWebHookUrl: config.incomingWebHookUrl?.unwrap(),
      notifyTo: config.notifyTo?.unwrap(),
      proxy: config.proxy,
      disabled: config.disabled,
    };
    return store
      .collection("slack")
      .doc(this.uid)
      .set(document)
      .then(() => {
        return null;
      })
      .catch((e) =>
        SaveSlackConfigError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
  }

  loadSlackConfig(): Promise<Either<LoadSlackConfigError, SlackConfig>> {
    return store
      .collection("slack")
      .doc(this.uid)
      .get()
      .then((x) => {
        const data = x.data() as FirestoreSlack;
        return data
          ? right<LoadSlackConfigError, SlackConfig>(toSlackConfig(data))
          : left<LoadSlackConfigError, SlackConfig>(
              LoadSlackConfigError.of({
                detail: `Slack config is empty`,
              })
            );
      })
      .catch((e) =>
        left(
          LoadSlackConfigError.of({
            detail: `${e.code}: ${e.message}`,
          })
        )
      );
  }

  saveRecentTask(recentTask: RecentTask): Promise<SaveRecentTaskError | null> {
    return store
      .collection("recentTask")
      .doc(this.uid)
      .set(fromRecentTask(recentTask))
      .then(() => {
        return null;
      })
      .catch((e) =>
        SaveRecentTaskError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
  }

  saveTimerConfig(config: TimerConfig): Promise<SaveTimerConfigError | null> {
    const document: FirestoreTimer = {
      token: config.token,
      workspaceId: config.workspaceId,
      proxy: config.proxy,
    };
    return store
      .collection("timer")
      .doc(this.uid)
      .set(document)
      .then(() => {
        return null;
      })
      .catch((e) =>
        SaveTimerConfigError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
  }

  loadTimerConfig(): Promise<Either<LoadTimerConfigError, TimerConfig>> {
    return store
      .collection("timer")
      .doc(this.uid)
      .get()
      .then((x) => {
        const data = x.data() as FirestoreTimer;
        return data
          ? right<LoadTimerConfigError, TimerConfig>(toTimerConfig(data))
          : left<LoadTimerConfigError, TimerConfig>(
              LoadTimerConfigError.of({
                detail: `Timer config is empty`,
              })
            );
      })
      .catch((e) =>
        left(
          LoadTimerConfigError.of({
            detail: `${e.code}: ${e.message}`,
          })
        )
      );
  }

  saveTaskConfig(config: TaskConfig): Promise<SaveTaskConfigError | null> {
    return store
      .collection("task")
      .doc(this.uid)
      .set(fromTaskConfig(config))
      .then(() => {
        return null;
      })
      .catch((e) =>
        SaveTaskConfigError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
  }

  loadTaskConfig(): Promise<Either<LoadTaskConfigError, TaskConfig>> {
    return store
      .collection("task")
      .doc(this.uid)
      .get()
      .then((x) => {
        const data = x.data() as FirestoreTask;
        return data
          ? right<LoadTaskConfigError, TaskConfig>(toTaskConfig(data))
          : left<LoadTaskConfigError, TaskConfig>(
              LoadTaskConfigError.of({
                detail: `Task config is empty`,
              })
            );
      })
      .catch((e) =>
        left(
          LoadTaskConfigError.of({
            detail: `${e.code}: ${e.message}`,
          })
        )
      );
  }

  saveAppConfig(config: AppConfig): Promise<SaveAppConfigError | null> {
    return store
      .collection("app")
      .doc(this.uid)
      .set(fromAppConfig(config))
      .then(() => {
        return null;
      })
      .catch((e) =>
        SaveAppConfigError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
  }

  loadAppConfig(): Promise<Either<LoadAppConfigError, AppConfig>> {
    return store
      .collection("app")
      .doc(this.uid)
      .get()
      .then((x) => {
        const data = x.data() as FirestoreAppConfig;
        return data
          ? right<LoadAppConfigError, AppConfig>(toAppConfig(data))
          : left<LoadAppConfigError, AppConfig>(
              LoadAppConfigError.of({
                detail: `App config is empty`,
              })
            );
      })
      .catch((e) =>
        left(
          LoadAppConfigError.of({
            detail: `${e.code}: ${e.message}`,
          })
        )
      );
  }

  saveProjectConfig(
    config: ProjectConfig
  ): Promise<SaveProjectConfigError | null> {
    return store
      .collection("projects")
      .doc(this.uid)
      .set(fromProjectConfig(config))
      .then(() => {
        return null;
      })
      .catch((e) =>
        SaveProjectConfigError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
  }

  loadProjectConfig(): Promise<Either<LoadProjectConfigError, ProjectConfig>> {
    return store
      .collection("projects")
      .doc(this.uid)
      .get()
      .then((x) => {
        const data = x.data() as FirestoreProject;
        return data
          ? right<LoadProjectConfigError, ProjectConfig>(toProjectConfig(data))
          : left<LoadProjectConfigError, ProjectConfig>(
              LoadProjectConfigError.of({
                detail: `Project config is empty`,
              })
            );
      })
      .catch((e) =>
        left(
          LoadProjectConfigError.of({
            detail: `${e.code}: ${e.message}`,
          })
        )
      );
  }

  saveProjectCategoryConfig(
    config: ProjectCategoryConfig
  ): Promise<SaveProjectCategoryConfigError | null> {
    return store
      .collection("projectCategories")
      .doc(this.uid)
      .set(fromProjectCategoryConfig(config))
      .then(() => {
        return null;
      })
      .catch((e) =>
        SaveProjectCategoryConfigError.of({
          detail: `${e.code}: ${e.message}`,
        })
      );
  }

  loadProjectCategoryConfig(): Promise<
    Either<LoadProjectCategoryConfigError, ProjectCategoryConfig>
  > {
    return store
      .collection("projectCategories")
      .doc(this.uid)
      .get()
      .then((x) => {
        const data = x.data() as FirestoreProjectCategory;
        return data
          ? right<LoadProjectCategoryConfigError, ProjectCategoryConfig>(
              toProjectCategoryConfig(data)
            )
          : left<LoadProjectCategoryConfigError, ProjectCategoryConfig>(
              LoadProjectCategoryConfigError.of({
                detail: `Project category config is empty`,
              })
            );
      })
      .catch((e) =>
        left(
          LoadProjectCategoryConfigError.of({
            detail: `${e.code}: ${e.message}`,
          })
        )
      );
  }
}

export default FirebaseCloudRepository;
