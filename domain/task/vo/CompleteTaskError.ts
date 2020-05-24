import { TogowlError } from "~/domain/common/TogowlError";
import { TaskId } from "~/domain/task/vo/TaskId";

export class CompleteTaskError extends TogowlError {
  code = "COMPLETE_TASK";
  name = "Fail to complete task.";

  static of(args: { taskId: TaskId }): CompleteTaskError {
    return new CompleteTaskError(
      `Fail to complete a task. id: ${args.taskId.asNumber}`
    );
  }
}
