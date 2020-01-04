import { User } from '~/domain/authentication/vo/User';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';

interface CloudRepository {
  login(payload?: LoginPayload): Promise<Either<TogowlError, User>>;
  logout(): void;
  saveSlackConfig(config: SlackConfig): Promise<TogowlError | null>;
  saveTimerConfig(config: TimerConfig): Promise<TogowlError | null>;
  getTimerConfig(): Promise<Either<TogowlError, TimerConfig>>;
}

export default CloudRepository;
