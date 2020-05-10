import { ValueObject } from "owlelia";
import { TaskId } from "~/domain/task/vo/TaskId";
import { EntryId } from "~/domain/timer/vo/EntryId";

interface Props {
  taskId?: TaskId;
  entryId?: EntryId;
}

type Args = Props;

export class RecentTask extends ValueObject<Props> {
  private _voCommonRecentTaskBrand!: never;

  static of(args: Args): RecentTask {
    return new RecentTask(args);
  }

  get taskId(): TaskId | undefined {
    return this._value.taskId;
  }

  get entryId(): EntryId | undefined {
    return this._value.entryId;
  }
}
