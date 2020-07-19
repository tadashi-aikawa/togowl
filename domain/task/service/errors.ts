import { TaskId } from "../vo/TaskId";
import { TogowlError } from "~/domain/common/TogowlError";

export class FetchProjectsError extends TogowlError {
  code = "FETCH_PROJECTS";
  name = "Fail to fetch projects.";

  static of(): FetchProjectsError {
    return new FetchProjectsError(`Fail to fetch projects.`);
  }
}
export class CompleteTaskError extends TogowlError {
  code = "COMPLETE_TASK";
  name = "Fail to complete task.";

  static of(args: { taskId: TaskId }): CompleteTaskError {
    return new CompleteTaskError(
      `Fail to complete a task. id: ${args.taskId.asNumber}`
    );
  }
}

export class FetchLabelsError extends TogowlError {
  code = "FETCH_LABELS";
  name = "Fail to fetch labels.";

  static of(): FetchLabelsError {
    return new FetchLabelsError(`Fail to fetch labels.`);
  }
}

export class FetchTasksError extends TogowlError {
  code = "FETCH_TASKS";
  name = "Fail to fetch tasks.";

  static of(args: { message?: string }): FetchTasksError {
    return new FetchTasksError(args.message);
  }
}

export class AddTaskError extends TogowlError {
  code = "ADD_TASK";
  name = "Fail to add a task.";

  static of(args: { title: string; detail: string }): AddTaskError {
    return new AddTaskError(
      `Fail to add a task. title: ${args.title}. ${args.detail}`
    );
  }
}
