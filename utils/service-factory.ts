import { TimerEventListener, TimerService } from '~/domain/timer/service/TimerService';
import { cloudRepository } from '~/store';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { Either, fold, left, right } from '~/node_modules/fp-ts/lib/Either';
import { TimerServiceImpl } from '~/domain/timer/service/TimerServiceImpl';
import { NotificationService } from '~/domain/notification/service/NotificationService';
import { NotificationServiceImpl } from '~/domain/notification/service/NotificationServiceImpl';
import { TogowlError } from '~/domain/common/TogowlError';
import { TaskEventListener, TaskService } from '~/domain/task/service/TaskService';
import { TaskServiceImpl } from '~/domain/task/service/TaskServiceImpl';

export async function createTimerService(listener: TimerEventListener): Promise<TimerService | null> {
  // FIXME: workspaceId
  return pipe(
    await cloudRepository.loadTimerConfig(),
    fold(
      _err => null,
      config => new TimerServiceImpl(config.token!, listener, config.workspaceId!, config.proxy),
    ),
  );
}

export async function createTaskService(listener: TaskEventListener): Promise<TaskService | null> {
  return pipe(
    await cloudRepository.loadTaskConfig(),
    fold(
      _err => null,
      config => new TaskServiceImpl(config.token!, config.syncToken!, listener),
    ),
  );
}

export async function createNotificationService(): Promise<Either<TogowlError, NotificationService>> {
  return pipe(
    await cloudRepository.loadSlackConfig(),
    fold(
      err => left(TogowlError.create(err.code, err.message)),
      config =>
        config.incomingWebHookUrl
          ? right(new NotificationServiceImpl(config.incomingWebHookUrl, config.notifyTo, config.proxy))
          : left(
              TogowlError.create('INCOMING_WEB_HOOK_URL_IS_EMPTY', 'Incoming web hook URL is required! It is empty!'),
            ),
    ),
  );
}
