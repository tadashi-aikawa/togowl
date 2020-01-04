import { TogowlError } from '~/domain/common/TogowlError';
import { Entry } from '~/domain/timer/vo/Entry';
import { Either, right } from '~/node_modules/fp-ts/lib/Either';
import { TimerService } from '~/domain/timer/service/TimerService';
import { Api } from '~/external/toggl';

export class TimerServiceImpl implements TimerService {
  client: Api.RestClient;

  constructor(togglToken: string) {
    this.client = new Api.RestClient(togglToken);
  }

  async fetchCurrentEntry(): Promise<Either<TogowlError, Entry>> {
    // FIXME: fix
    const ret = await this.client.timeEntryCurrent();
    return right(Entry.create(ret.id, ret.description, ret.start, ret.duration));
  }
}
