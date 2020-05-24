import { TogowlError } from "~/domain/common/TogowlError";

export class FetchEntriesError extends TogowlError {
  code = "FETCH_ENTRIES";
  name = "Fail to fetch entries.";

  static of(args: { detail: string }): FetchEntriesError {
    return new FetchEntriesError(`Fail to fetch entries. ${args.detail}`);
  }
}
