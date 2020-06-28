import { Either } from "owlelia";
import { User } from "~/domain/authentication/vo/User";
import { LoginPayload } from "~/domain/authentication/vo/LoginPayload";
import { SlackConfig } from "~/domain/notification/vo/SlackConfig";
import { TimerConfig } from "~/domain/timer/vo/TimerConfig";
import { ProjectConfig } from "~/domain/timer/vo/ProjectConfig";
import { ProjectCategoryConfig } from "~/domain/timer/vo/ProjectCategoryConfig";
import { TaskConfig } from "~/domain/task/vo/TaskConfig";
import { RecentTask } from "~/domain/common/RecentTask";
import { UId } from "~/domain/authentication/vo/UId";
import {
  LoadAppConfigError,
  LoadProjectCategoryConfigError,
  LoadProjectConfigError,
  LoadSlackConfigError,
  LoadTaskConfigError,
  LoadTimerConfigError,
  LoadUserError,
  LoginError,
  SaveAppConfigError,
  SaveProjectCategoryConfigError,
  SaveProjectConfigError,
  SaveRecentTaskError,
  SaveSlackConfigError,
  SaveTaskConfigError,
  SaveTimerConfigError,
} from "~/repository/firebase-errors";
import { AppConfig } from "~/domain/app/vo/AppConfig";

interface CloudRepository {
  login(payload?: LoginPayload): Promise<Either<LoginError, User>>;
  loadUser(userId: UId): Promise<Either<LoadUserError, User>>;
  logout(): void;

  saveRecentTask(recentTask: RecentTask): Promise<SaveRecentTaskError | null>;

  saveSlackConfig(config: SlackConfig): Promise<SaveSlackConfigError | null>;
  loadSlackConfig(): Promise<Either<LoadSlackConfigError, SlackConfig>>;

  saveTimerConfig(config: TimerConfig): Promise<SaveTimerConfigError | null>;
  loadTimerConfig(): Promise<Either<LoadTimerConfigError, TimerConfig>>;

  saveAppConfig(config: AppConfig): Promise<SaveAppConfigError | null>;
  loadAppConfig(): Promise<Either<LoadAppConfigError, AppConfig>>;

  saveTaskConfig(config: TaskConfig): Promise<SaveTaskConfigError | null>;
  loadTaskConfig(): Promise<Either<LoadTaskConfigError, TaskConfig>>;

  saveProjectConfig(
    config: ProjectConfig
  ): Promise<SaveProjectConfigError | null>;
  loadProjectConfig(): Promise<Either<LoadProjectConfigError, ProjectConfig>>;

  saveProjectCategoryConfig(
    config: ProjectCategoryConfig
  ): Promise<SaveProjectCategoryConfigError | null>;
  loadProjectCategoryConfig(): Promise<
    Either<LoadProjectCategoryConfigError, ProjectCategoryConfig>
  >;
}

export default CloudRepository;
