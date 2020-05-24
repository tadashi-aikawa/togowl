import { TogowlError } from "~/domain/common/TogowlError";

export class FetchCurrentEntryError extends TogowlError {
  code = "FETCH_CURRENT_ENTRY";
  name = "Fail to fetch a current entry.";

  static of(): FetchCurrentEntryError {
    return new FetchCurrentEntryError(`Fail to fetch a current entry.`);
  }
}
