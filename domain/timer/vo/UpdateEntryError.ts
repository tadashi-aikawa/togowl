import { TogowlError } from "~/domain/common/TogowlError";
import { Project } from "~/domain/timer/entity/Project";

export class UpdateEntryError extends TogowlError {
  code = "UPDATE_ENTRY";
  name = "Fail to update a entry.";

  static of(args: {
    title: string;
    project?: Project;
    stack?: string;
  }): UpdateEntryError {
    return new UpdateEntryError(
      `Fail to update a entry, ${args.title}(${
        args.project?.name ?? "No Project"
      }).`,
      args.stack
    );
  }
}
