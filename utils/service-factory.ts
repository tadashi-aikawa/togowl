import { TimerEventListener, TimerService } from '~/domain/timer/service/TimerService';
import { cloudRepository } from '~/store';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';
import { TimerServiceImpl } from '~/domain/timer/service/TimerServiceImpl';

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
