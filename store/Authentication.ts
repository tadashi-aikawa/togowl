import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { TogowlError } from "~/domain/common/TogowlError";
import { LoginPayload } from "~/domain/authentication/vo/LoginPayload";
import {
  notificationStore,
  projectStore,
  taskStore,
  timerStore,
  userStore,
  appStore,
} from "~/utils/store-accessor";
import firebase from "~/plugins/firebase";
import { UId } from "~/domain/authentication/vo/UId";
import { AuthenticationStatus } from "~/domain/authentication/vo/AuthenticationStatus";
import { cloudRepository } from "~/store/index";
import logger from "~/utils/global-logger";

async function initCloudStores(uid: UId) {
  userStore.init(uid);
  appStore.init(uid);
  notificationStore.init(uid);
  taskStore.init(uid);
  projectStore.init(uid);
  await timerStore.init(uid);
}

@Module({ name: "Authentication", namespaced: true, stateFactory: true })
class AuthenticationModule extends VuexModule {
  status: AuthenticationStatus = "init";
  error: TogowlError | null = null;

  @Mutation
  setAuthenticationStatus(status: AuthenticationStatus) {
    this.status = status;
  }

  @Mutation
  setError(error: TogowlError | null) {
    this.error = error;
  }

  @Action
  init() {
    logger.put(`AuthenticationStore.init`);
    this.setAuthenticationStatus("check");
    firebase.auth().onAuthStateChanged(async (user) => {
      logger.put(`AuthenticationStore.onAuthStateChanged: ${user}`);
      if (!user) {
        this.setError(null);
        this.setAuthenticationStatus("logout");
        return;
      }

      logger.put(`AuthenticationStore.loadUser: ${user}`);
      const userOrErr = await cloudRepository.loadUser(UId.of(user.uid));
      if (userOrErr.isLeft()) {
        logger.put(`AuthenticationStore.loadUser.error: ${user}`);
        this.setError(userOrErr.error);
        this.setAuthenticationStatus("error");
        return;
      }

      logger.put(`AuthenticationStore.loadUser.success: ${user}`);
      await initCloudStores(userOrErr.value.uid);
      this.setAuthenticationStatus("login");
    });
  }

  @Action
  async login(payload: LoginPayload) {
    this.setError(null);
    this.setAuthenticationStatus("check");

    logger.put(`AuthenticationStore.login`);
    const loginUserOrErr = await cloudRepository.login(payload);
    if (loginUserOrErr.isLeft()) {
      logger.put(`AuthenticationStore.login.error`);
      this.setError(loginUserOrErr.error);
      this.setAuthenticationStatus("error");
      return;
    }

    logger.put(`AuthenticationStore.login.success`);
    await initCloudStores(loginUserOrErr.value.uid);
    this.setAuthenticationStatus("login");
  }

  @Action
  async logout() {
    this.setAuthenticationStatus("logout");
    await cloudRepository.logout();
  }
}

export default AuthenticationModule;
