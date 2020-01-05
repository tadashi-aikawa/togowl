import { TogowlError } from '~/domain/common/TogowlError';
import { Entry } from '~/domain/timer/vo/Entry';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import { TimerEventListener, TimerService } from '~/domain/timer/service/TimerService';
import * as toggl from '~/external/toggl';
import logger from '~/utils/global-logger';

const transformEntry = (entry: toggl.TimeEntry): Entry =>
  Entry.create(entry.id, entry.description, entry.start, entry.duration);

export class TimerServiceImpl implements TimerService {
  restClient: toggl.RestApi.Client;
  socketClient: toggl.SocketApi.Client;

  constructor(togglToken: string, listener: TimerEventListener, proxy?: string) {
    this.restClient = new toggl.RestApi.Client(togglToken, proxy);
    this.socketClient = toggl.SocketApi.Client.use(togglToken, {
      onOpen: () => {
        logger.put('TimerServiceImpl.onOpen');
        listener.onStartSubscribe?.();
      },
      onClose: event => {
        logger.put('TimerServiceImpl.onClose');
        logger.put(`[Code] ${event.code}`);
        logger.put(`[Reason] ${event.reason}`);
        listener.onEndSubscribe?.();
      },
      onError: event => {
        logger.put('TimerServiceImpl.onError');
        logger.put(`[Code] ${event.code}`);
        logger.put(`[Reason] ${event.reason}`);
        listener.onError?.(TogowlError.create('SUBSCRIBE_TIMER_ERROR', 'Fail to subscribe timer event', event.reason));
      },
      onInsertEntry: entry => {
        logger.put('TimerServiceImpl.onInsertEntry');
        listener.onInsertEntry?.(transformEntry(entry));
      },
      onUpdateEntry: entry => {
        logger.put('TimerServiceImpl.onUpdateEntry');
        listener.onUpdateEntry?.(transformEntry(entry));
      },
      onDeleteEntry: entry => {
        logger.put('TimerServiceImpl.onDeleteEntry');
        listener.onDeleteEntry?.(transformEntry(entry));
      },
      onResponsePing: () => logger.put('TimerServiceImpl.onResponsePing'),
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

  async stopEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    try {
      const afterEntry = (await this.restClient.timeEntryStop(entry.id.asNumber)).data;
      return right(transformEntry(afterEntry));
    } catch (err) {
      return left(TogowlError.create('STOP_CURRENT_ENTRY', "Can't stop current entry from Toggl", err.message));
    }
  }
}
