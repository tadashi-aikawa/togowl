import { TogowlError } from "~/domain/common/TogowlError";
import { TaskId } from "~/domain/task/vo/TaskId";

export class UpdateTaskError extends TogowlError {
  code = "UPDATE_TASK";
  name = "Fail to update a task.";

  static of(args: {
    taskId: TaskId;
    detail: string;
    stack?: string;
  }): UpdateTaskError {
    return new UpdateTaskError(
      `Fail to update a task. id: ${args.taskId.asNumber}. ${args.detail}`,
      args.stack
    );
  }
}
