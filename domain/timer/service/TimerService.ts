import { Either } from "owlelia";
import { Entry, PartialEntry } from "~/domain/timer/entity/Entry";
import { Project } from "~/domain/timer/entity/Project";
import { DateTime } from "~/domain/common/DateTime";
import { SubscribeTaskError } from "~/domain/task/vo/SubscribeTaskError";
import { FetchCurrentEntryError } from "~/domain/timer/vo/FetchCurrentEntryError";
import { StartEntryError } from "~/domain/timer/vo/StartEntryError";
import { UpdateEntryError } from "~/domain/timer/vo/UpdateEntryError";
import { StopEntryError } from "~/domain/timer/vo/StopEntryError";
import { DeleteEntryError } from "~/domain/timer/vo/DeleteEntryError";
import { FetchEntriesError } from "~/domain/timer/vo/FetchEntriesError";
import { FetchProjectsError } from "~/domain/timer/vo/FetchProjectsError";

export interface TimerEventListener {
  onStartSubscribe?(): void;
  onEndSubscribe?(): void;
  onError?(err: SubscribeTaskError): void;
  onInsertEntry?(entry: Entry): void;
  onUpdateEntry?(entry: Entry): void;
  onDeleteEntry?(entry: Entry): void;
  onUpdateProject?(): void;
}

export interface TimerService {
  fetchCurrentEntry(): Promise<Either<FetchCurrentEntryError, Entry | null>>;
  startEntry(
    description: string,
    project?: Project
  ): Promise<Either<StartEntryError, Entry>>;
  updateEntry(
    entry: Entry,
    value: PartialEntry
  ): Promise<Either<UpdateEntryError, Entry>>;
  stopEntry(entry: Entry): Promise<Either<StopEntryError, Entry>>;
  deleteEntry(entry: Entry): Promise<Either<DeleteEntryError, Entry>>;
  fetchEntries(since: DateTime): Promise<Either<FetchEntriesError, Entry[]>>;
  fetchProjects(): Promise<Either<FetchProjectsError, Project[]>>;
  terminate(): void;
}
