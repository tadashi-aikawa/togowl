import { Either, left, right } from "owlelia";
import {
  TimerEventListener,
  TimerService,
} from "~/domain/timer/service/TimerService";
import { cloudRepository } from "~/store";
import { TimerServiceImpl } from "~/domain/timer/service/TimerServiceImpl";
import { NotificationService } from "~/domain/notification/service/NotificationService";
import { NotificationServiceImpl } from "~/domain/notification/service/NotificationServiceImpl";
import { TogowlError } from "~/domain/common/TogowlError";
import {
  TaskEventListener,
  TaskService,
} from "~/domain/task/service/TaskService";
import { TaskServiceImpl } from "~/domain/task/service/TaskServiceImpl";

export class CreateServiceError extends TogowlError {
  code = "CREATE_SERVICE";
  name = "Fail to create service.";

  static of(args: {
    serviceName?: string;
    reason?: string;
  }): CreateServiceError {
    return new CreateServiceError(
      `Fail to create ${args.serviceName} because ${args.reason}`
    );
  }
}

export async function createTimerService(
  listener: TimerEventListener
): Promise<TimerService> {
  // FIXME: workspaceId
  // TODO: Either return
  const config = (await cloudRepository.loadTimerConfig()).orThrow();

  return new TimerServiceImpl(
    config.token!,
    listener,
    config.workspaceId!,
    config.proxy
  );
}

export async function createTaskService(
  listener: TaskEventListener
): Promise<TaskService> {
  const config = (await cloudRepository.loadTaskConfig()).orThrow();
  return new TaskServiceImpl(config.token!, config.syncToken!, listener);
}

export async function createNotificationService(): Promise<
  Either<CreateServiceError, NotificationService>
> {
  const configOrErr = await cloudRepository.loadSlackConfig();
  if (configOrErr.isLeft()) {
    return left(
      CreateServiceError.of({
        serviceName: "NotificationService",
        reason: configOrErr.error.message,
      })
    );
  }

  const config = configOrErr.value;
  if (!config.incomingWebHookUrl) {
    return left(
      CreateServiceError.of({
        serviceName: "NotificationService",
        reason: "Slack incoming web hook URL is empty.",
      })
    );
  }

  return right(
    new NotificationServiceImpl(
      config.incomingWebHookUrl,
      config.notifyTo,
      config.proxy
    )
  );
}
