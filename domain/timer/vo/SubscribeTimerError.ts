import { TogowlError } from "~/domain/common/TogowlError";

export class SubscribeTimerError extends TogowlError {
  code = "SUBSCRIBE_TIMER";
  name = "Fail to subscribe timer events.";

  static of(args: { stack?: string }): SubscribeTimerError {
    return new SubscribeTimerError(
      `Fail to subscribe timer events.`,
      args.stack
    );
  }
}
