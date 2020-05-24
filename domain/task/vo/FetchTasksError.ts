import { TogowlError } from "~/domain/common/TogowlError";

export class FetchTasksError extends TogowlError {
  code = "FETCH_TASKS";
  name = "Fail to fetch tasks.";

  static of(args: { message?: string }): FetchTasksError {
    return new FetchTasksError(args.message);
  }
}
