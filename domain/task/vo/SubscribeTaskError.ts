import { TogowlError } from "~/domain/common/TogowlError";

export class SubscribeTaskError extends TogowlError {
  code = "SUBSCRIBE_TASK";
  name = "Fail to subscribe task events.";

  static of(args: { stack?: string }): SubscribeTaskError {
    return new SubscribeTaskError(`Fail to subscribe task events.`, args.stack);
  }
}
