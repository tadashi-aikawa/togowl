import { DateTime } from "~/domain/common/DateTime";

class Logger {
  constructor(private _logs: string[] = []) {}

  put(log: string) {
    this._logs.push(`[${DateTime.now().displayTime}] ${log}`);
  }

  clear(): void {
    this._logs = [];
  }

  get logs(): string[] {
    return this._logs;
  }
}

const logger = new Logger();
export default logger;
