import { User } from '~/domain/authentication/vo/User';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';
import { ProjectConfig } from '~/domain/timer/vo/ProjectConfig';
import { ProjectCategoryConfig } from '~/domain/timer/vo/ProjectCategoryConfig';
import { TaskConfig } from '~/domain/task/vo/TaskConfig';
import { RecentTask } from '~/domain/common/RecentTask';
import { UId } from '~/domain/authentication/vo/UId';

interface CloudRepository {
  login(payload?: LoginPayload): Promise<Either<TogowlError, User>>;
  loadUser(userId: UId): Promise<Either<TogowlError, User>>;
  logout(): void;

  saveRecentTask(recentTask: RecentTask): Promise<TogowlError | null>;

  saveSlackConfig(config: SlackConfig): Promise<TogowlError | null>;
  loadSlackConfig(): Promise<Either<TogowlError, SlackConfig>>;

  saveTimerConfig(config: TimerConfig): Promise<TogowlError | null>;
  loadTimerConfig(): Promise<Either<TogowlError, TimerConfig>>;

  saveTaskConfig(config: TaskConfig): Promise<TogowlError | null>;
  loadTaskConfig(): Promise<Either<TogowlError, TaskConfig>>;

  saveProjectConfig(config: ProjectConfig): Promise<TogowlError | null>;
  loadProjectConfig(): Promise<Either<TogowlError, ProjectConfig>>;

  saveProjectCategoryConfig(config: ProjectCategoryConfig): Promise<TogowlError | null>;
  loadProjectCategoryConfig(): Promise<Either<TogowlError, ProjectCategoryConfig>>;
}

export default CloudRepository;
