import { TogowlError } from '~/domain/common/TogowlError';
import { Entry } from '~/domain/timer/vo/Entry';
import { Either } from '~/node_modules/fp-ts/lib/Either';

export interface TimerService {
  fetchCurrentEntry: () => Promise<Either<TogowlError, Entry>>;
}
