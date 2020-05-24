import { TogowlError } from "~/domain/common/TogowlError";
import { Project } from "~/domain/timer/entity/Project";

export class DeleteEntryError extends TogowlError {
  code = "DELETE_ENTRY";
  name = "Fail to delete a entry.";

  static of(args: { title: string; project?: Project }): DeleteEntryError {
    return new DeleteEntryError(
      `Fail to delete a entry, ${args.title}(${
        args.project?.name ?? "No Project"
      }).`
    );
  }
}
