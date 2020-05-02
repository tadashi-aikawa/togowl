import { ValueObject } from "~/utils/vo";
import { TaskId } from "~/domain/task/vo/TaskId";
import { EntryId } from "~/domain/timer/vo/EntryId";

interface Props {
  taskId?: TaskId;
  entryId?: EntryId;
}

export class RecentTask extends ValueObject<Props> {
  static create(taskId?: TaskId, entryId?: EntryId): RecentTask {
    return new RecentTask({
      taskId,
      entryId,
    });
  }

  get taskId(): TaskId | undefined {
    return this._value.taskId;
  }

  get entryId(): EntryId | undefined {
    return this._value.entryId;
  }
}
