import { TogowlError } from "~/domain/common/TogowlError";
import { Project } from "~/domain/timer/entity/Project";

export class StartEntryError extends TogowlError {
  code = "START_ENTRY";
  name = "Fail to start a entry.";

  static of(args: {
    title: string;
    project?: Project;
    stack?: string;
  }): StartEntryError {
    return new StartEntryError(
      `Fail to start a entry, ${args.title}(${
        args.project?.name ?? "No Project"
      }).`,
      args.stack
    );
  }
}
