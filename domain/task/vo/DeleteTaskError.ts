import { TogowlError } from "~/domain/common/TogowlError";
import { TaskId } from "~/domain/task/vo/TaskId";

export class DeleteTaskError extends TogowlError {
  code = "DELETE_TASK";
  name = "Fail to delete a task.";

  static of(args: { taskId: TaskId; detail: string }): DeleteTaskError {
    return new DeleteTaskError(
      `Fail to delete a task. id: ${args.taskId.asNumber}. ${args.detail}`
    );
  }
}
