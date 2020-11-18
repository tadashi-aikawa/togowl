import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { UId } from "~/domain/authentication/vo/UId";
import { SlackConfig } from "~/domain/notification/vo/SlackConfig";
import {
  FirestoreSlack,
  toSlackConfig,
} from "~/repository/FirebaseCloudRepository";
import { cloudRepository } from "~/store/index";
import { TogowlError } from "~/domain/common/TogowlError";
import { ActionStatus } from "~/domain/common/ActionStatus";
import { createAction } from "~/utils/firestore-facade";
import { NotificationService } from "~/domain/notification/service/NotificationService";
import { createNotificationService } from "~/utils/service-factory";
import { Entry } from "~/domain/timer/entity/Entry";

let service: NotificationService | null;

/**
 * Concrete implementation by using firebase
 */
@Module({ name: "Slack", namespaced: true, stateFactory: true })
class SlackModule extends VuexModule {
  _slack: FirestoreSlack | null = null;
  get slackConfig(): SlackConfig | null {
    return this._slack ? toSlackConfig(this._slack) : null;
  }

  updateStatus: ActionStatus = "init";
  @Mutation
  setUpdateStatus(status: ActionStatus) {
    this.updateStatus = status;
  }

  updateError: TogowlError | null = null;
  @Mutation
  setUpdateError(error: TogowlError | null) {
    this.updateError = error;
  }

  @Action({ rawError: true })
  async updateSlackConfig(config: SlackConfig) {
    this.setUpdateError(null);
    this.setUpdateStatus("in_progress");

    const err = await cloudRepository.saveSlackConfig(config);
    if (err) {
      this.setUpdateStatus("error");
      this.setUpdateError(err);
      return;
    }

    // TODO: extract & integrate?
    const serviceOrErr = await createNotificationService();
    if (serviceOrErr.isLeft()) {
      this.setUpdateError(serviceOrErr.error);
      return;
    }

    service = serviceOrErr.value;
    this.setUpdateStatus("success");
  }

  @Action({ rawError: true })
  async notifyStartEvent(entry: Entry): Promise<TogowlError | undefined> {
    if (this.slackConfig?.disabled) {
      return;
    }

    const err = await service!.start(entry);
    if (err) {
      console.error(err.messageForLog);
      return err;
    }
  }

  @Action({ rawError: true })
  async notifyDoneEvent(entry: Entry): Promise<TogowlError | undefined> {
    if (this.slackConfig?.disabled) {
      return;
    }

    const err = await service!.done(entry);
    if (err) {
      console.error(err.messageForLog);
      return err;
    }
  }

  @Action({ rawError: true })
  async notifyPauseEvent(entry: Entry): Promise<TogowlError | undefined> {
    if (this.slackConfig?.disabled) {
      return;
    }

    const err = await service!.pause(entry);
    if (err) {
      console.error(err.messageForLog);
      return err;
    }
  }

  @Action({ rawError: true })
  async notifyCancelEvent(): Promise<TogowlError | undefined> {
    const err = await service!.cancel();
    if (this.slackConfig?.disabled) {
      return;
    }

    if (err) {
      console.error(err.messageForLog);
      return err;
    }
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.unwrap(), "_slack", "slack")(this.context);

    const serviceOrErr = await createNotificationService();
    if (serviceOrErr.isLeft()) {
      this.setUpdateError(serviceOrErr.error);
      return;
    }

    service = serviceOrErr.value;
    this.setUpdateStatus("success");
  }
}

export default SlackModule;
