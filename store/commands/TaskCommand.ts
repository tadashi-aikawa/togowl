import _ from "lodash";
import { TogowlError } from "~/domain/common/TogowlError";
import { Task } from "~/domain/task/entity/Task";
import { TaskId } from "~/domain/task/vo/TaskId";
import { DateTime } from "~/domain/common/DateTime";

interface Command {
  exec(): Promise<TogowlError | null>;
}

export class CompleteCommand implements Command {
  constructor(
    public execFunction: (taskId: TaskId) => Promise<TogowlError | null>,
    public taskId: TaskId
  ) {}

  exec(): Promise<TogowlError | null> {
    return this.execFunction(this.taskId);
  }
}

export class DeleteCommand implements Command {
  constructor(
    public execFunction: (taskId: TaskId) => Promise<TogowlError | null>,
    public taskId: TaskId
  ) {}

  exec(): Promise<TogowlError | null> {
    return this.execFunction(this.taskId);
  }
}

export class UpdateDueDateCommand implements Command {
  constructor(
    public execFunction: (
      taskId: TaskId,
      date: DateTime,
      optional: {
        dayOrder?: number;
      }
    ) => Promise<TogowlError | null>,
    public taskId: TaskId,
    public date: DateTime,
    public optional: { dayOrder?: number }
  ) {}

  exec(): Promise<TogowlError | null> {
    return this.execFunction(this.taskId, this.date, this.optional);
  }
}

export class UpdateOrderCommand implements Command {
  constructor(
    public execFunction: (taskById: {
      [taskId: number]: Task;
    }) => Promise<TogowlError | null>,
    public taskById: { [taskId: number]: Task }
  ) {}

  exec(): Promise<TogowlError | null> {
    return this.execFunction(this.taskById);
  }
}

interface SyncNeededListener {
  onSyncNeeded(): void;
}

export class CommandExecutor {
  private commands: Command[] = [];
  private syncNeeded = false;
  private timerId: number;
  private lastExecutedDateTime: DateTime;

  constructor(public listener: SyncNeededListener) {}

  needSync(clientId?: string): CommandExecutor {
    // `clientId is defined` means sync from Todoist official application and others
    if (
      clientId ||
      !this.lastExecutedDateTime ||
      !this.lastExecutedDateTime.within(3)
    ) {
      this.syncNeeded = true;
    }
    return this;
  }

  add(task: Command): CommandExecutor {
    this.commands.push(task);
    return this;
  }

  execAll(delaySeconds = 0): Promise<TogowlError> {
    return new Promise((resolve, reject) => {
      if (this.timerId) {
        window.clearTimeout(this.timerId);
      }

      const lastUpdateOrderCommand = _.last(
        this.commands.filter((x) => x instanceof UpdateOrderCommand)
      );
      _.remove(
        this.commands,
        (x) => x instanceof UpdateOrderCommand && x !== lastUpdateOrderCommand
      );

      this.timerId = window.setTimeout(async () => {
        while (this.commands.length > 0) {
          const task = this.commands.shift()!;
          this.lastExecutedDateTime = DateTime.now();
          const err = await task.exec();
          if (err) {
            reject(err);
            return;
          }
        }

        if (this.syncNeeded) {
          this.listener.onSyncNeeded();
          this.syncNeeded = false;
        }

        resolve();
      }, delaySeconds);
    });
  }
}
