import { TogowlError } from "~/domain/common/TogowlError";

export class SubscribeTaskError extends TogowlError {
  code = "SUBSCRIBE_TASK";
  name = "Fail to subscribe task events.";

  static of(args: { message?: string }): SubscribeTaskError {
    return new SubscribeTaskError(args.message);
  }
}
