import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { UId } from "~/domain/authentication/vo/UId";
import { TogowlError } from "~/domain/common/TogowlError";
import { cloudRepository } from "~/store/index";
import { ActionStatus } from "~/domain/common/ActionStatus";
import { createAction } from "~/utils/firestore-facade";
import { AppConfig } from "~/domain/app/vo/AppConfig";
import { toAppConfig } from "~/repository/FirebaseCloudRepository";
import { Theme } from "~/domain/app/vo/Theme";

/**
 * Concrete implementation by using firebase
 */
@Module({ name: "App", namespaced: true, stateFactory: true })
class AppModule extends VuexModule {
  private _config: AppConfig | null = null;
  get config(): AppConfig {
    return this._config ? toAppConfig(this._config) : AppConfig.empty();
  }

  status: ActionStatus = "init";
  @Mutation
  setStatus(status: ActionStatus) {
    this.status = status;
  }

  error: TogowlError | null = null;
  @Mutation
  setError(error: TogowlError | null) {
    this.error = error;
  }

  @Action({ rawError: true })
  async updateTheme(theme: Theme) {
    this.setStatus("in_progress");
    const err = await cloudRepository.saveAppConfig(
      this.config.cloneWith({ theme })
    );
    if (err) {
      this.setStatus("error");
      // TODO: Show on UI
      console.error(err);
      return;
    }

    this.setStatus("success");
  }

  @Action({ rawError: true })
  init(uid: UId) {
    createAction(uid.unwrap(), "_config", "app")(this.context);
  }
}

export default AppModule;
