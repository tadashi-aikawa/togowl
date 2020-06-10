import { TogowlError } from "~/domain/common/TogowlError";

export class FetchLabelsError extends TogowlError {
  code = "FETCH_LABELS";
  name = "Fail to fetch labels.";

  static of(): FetchLabelsError {
    return new FetchLabelsError(`Fail to fetch labels.`);
  }
}
