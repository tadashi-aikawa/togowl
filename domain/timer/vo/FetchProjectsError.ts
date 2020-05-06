import { TogowlError } from "~/domain/common/TogowlError";

export class FetchProjectsError extends TogowlError {
  code = "FETCH_PROJECTS";
  name = "Fail to fetch projects.";

  static of(args: { stack?: string }): FetchProjectsError {
    return new FetchProjectsError(`Fail to fetch projects.`, args.stack);
  }
}
