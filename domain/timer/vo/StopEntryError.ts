import { TogowlError } from "~/domain/common/TogowlError";
import { Project } from "~/domain/timer/entity/Project";

export class StopEntryError extends TogowlError {
  code = "STOP_ENTRY";
  name = "Fail to stop a entry.";

  static of(args: { title: string; project?: Project }): StopEntryError {
    return new StopEntryError(
      `Fail to stop a entry, ${args.title}(${
        args.project?.name ?? "No Project"
      }).`
    );
  }
}
