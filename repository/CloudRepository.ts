import { User } from '~/domain/authentication/vo/User';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';
import { ProjectConfig } from '~/domain/timer/vo/ProjectConfig';
import { ProjectCategoryConfig } from '~/domain/timer/vo/ProjectCategoryConfig';

interface CloudRepository {
  login(payload?: LoginPayload): Promise<Either<TogowlError, User>>;
  logout(): void;
  saveSlackConfig(config: SlackConfig): Promise<TogowlError | null>;
  loadSlackConfig(): Promise<Either<TogowlError, SlackConfig>>;
  saveTimerConfig(config: TimerConfig): Promise<TogowlError | null>;
  loadTimerConfig(): Promise<Either<TogowlError, TimerConfig>>;
  loadProjectConfig(): Promise<Either<TogowlError, ProjectConfig>>;
  loadProjectCategoryConfig(): Promise<Either<TogowlError, ProjectCategoryConfig>>;
}

export default CloudRepository;
