import { TogowlError } from '~/domain/common/TogowlError';
import { Entry } from '~/domain/timer/vo/Entry';
import { Either, right } from '~/node_modules/fp-ts/lib/Either';
import { TimerService } from '~/domain/timer/service/TimerService';
import { RestApi } from '~/external/toggl';

export class TimerServiceImpl implements TimerService {
  client: RestApi.Client;

  constructor(togglToken: string, proxy?: string) {
    this.client = new RestApi.Client(togglToken, proxy);
  }

  async fetchCurrentEntry(): Promise<Either<TogowlError, Entry>> {
    // FIXME: fix
    const ret = await this.client.timeEntryCurrent();
    return right(Entry.create(ret.id, ret.description, ret.start, ret.duration));
  }
}