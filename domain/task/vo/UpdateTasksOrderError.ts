import { TogowlError } from "~/domain/common/TogowlError";

export class UpdateTasksOrderError extends TogowlError {
  code = "UPDATE_TASKS_ORDER";
  name = "Fail to update tasks order.";

  static of(): UpdateTasksOrderError {
    return new UpdateTasksOrderError(`Fail to update a tasks order.`);
  }
}
