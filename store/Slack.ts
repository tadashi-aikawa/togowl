import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { UId } from '~/domain/authentication/vo/UId';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';
import { FirestoreSlack, toSlackConfig } from '~/repository/FirebaseCloudRepository';
import { cloudRepository } from '~/store/index';
import { TogowlError } from '~/domain/common/TogowlError';
import { ActionStatus } from '~/domain/common/ActionStatus';
import { createAction } from '~/utils/firestore-facade';
import { NotificationService } from '~/domain/notification/service/NotificationService';
import { createNotificationService } from '~/utils/service-factory';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';

let service: NotificationService | null;

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Slack', namespaced: true, stateFactory: true })
class SlackModule extends VuexModule {
  _slack: FirestoreSlack | null = null;
  get slackConfig(): SlackConfig | null {
    return this._slack ? toSlackConfig(this._slack) : null;
  }

  updateStatus: ActionStatus = 'init';
  @Mutation
  setUpdateStatus(status: ActionStatus) {
    this.updateStatus = status;
  }

  updateError: TogowlError | null = null;
  @Mutation
  setUpdateError(error: TogowlError | null) {
    this.updateError = error;
  }

  @Action
  async updateSlackConfig(config: SlackConfig) {
    this.setUpdateError(null);
    this.setUpdateStatus('in_progress');

    const err = await cloudRepository.saveSlackConfig(config);
    if (!err) {
      this.setUpdateStatus('error');
      this.setUpdateError(err);
      return;
    }

    // TODO: extract & integrate?
    pipe(
      await createNotificationService(),
      fold(
        err => this.setUpdateError(err),
        s => {
          service = s;
          this.setUpdateStatus('success');
        },
      ),
    );
  }

  @Action
  async notifyToSlack(message: string): Promise<TogowlError | null> {
    const err = await service!.notifyToSlack(message);
    if (err) {
      console.error(err.messageForLog);
      return TogowlError.create(err.code, err.message);
    }

    return null;
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.value, '_slack', 'slack')(this.context);

    // TODO: extract & integrate?
    pipe(
      await createNotificationService(),
      fold(
        err => this.setUpdateError(err),
        s => {
          service = s;
          this.setUpdateStatus('success');
        },
      ),
    );
  }
}

export default SlackModule;
