import { TogowlError } from "~/domain/common/TogowlError";

export class FetchTasksError extends TogowlError {
  code = "FETCH_TASKS";
  name = "Fail to fetch tasks.";

  static of(args: { stack?: string }): FetchTasksError {
    return new FetchTasksError(`Fail to fetch tasks.`, args.stack);
  }
}
