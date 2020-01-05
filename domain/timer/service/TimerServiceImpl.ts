import { TogowlError } from '~/domain/common/TogowlError';
import { Entry } from '~/domain/timer/vo/Entry';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import { TimerEventListener, TimerService } from '~/domain/timer/service/TimerService';
import * as toggl from '~/external/toggl';

const transformEntry = (entry: toggl.TimeEntry): Entry =>
  Entry.create(entry.id, entry.description, entry.start, entry.duration);

export class TimerServiceImpl implements TimerService {
  restClient: toggl.RestApi.Client;
  socketClient: toggl.SocketApi.Client;

  constructor(togglToken: string, listener: TimerEventListener, proxy?: string) {
    this.restClient = new toggl.RestApi.Client(togglToken, proxy);
    this.socketClient = toggl.SocketApi.Client.use(togglToken, {
      onOpen: listener.onStartSubscribe,
      onError: err =>
        listener.onError?.(TogowlError.create('SUBSCRIBE_TIMER_ERROR', 'Fail to subscribe timer event', String(err))),
      onInsertEntry: entry => listener.onInsertEntry?.(transformEntry(entry)),
      onUpdateEntry: entry => listener.onUpdateEntry?.(transformEntry(entry)),
      onDeleteEntry: entry => listener.onDeleteEntry?.(transformEntry(entry)),
    });
  }

  async fetchCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    try {
      const entry = (await this.restClient.timeEntryCurrent()).data;
      return right(entry ? transformEntry(entry) : null);
    } catch (err) {
      return left(TogowlError.create('FETCH_CURRENT_ENTRY', "Can't fetch current entry from Toggl", err.message));
    }
  }
}
