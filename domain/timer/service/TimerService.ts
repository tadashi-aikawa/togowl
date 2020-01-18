import { TogowlError } from '~/domain/common/TogowlError';
import { Entry } from '~/domain/timer/vo/Entry';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { Project } from '~/domain/timer/entity/Project';
import { DateTime } from '~/domain/common/DateTime';

export interface TimerEventListener {
  onStartSubscribe?(): void;
  onEndSubscribe?(): void;
  onError?(err: TogowlError): void;
  onInsertEntry?(entry: Entry): void;
  onUpdateEntry?(entry: Entry): void;
  onDeleteEntry?(entry: Entry): void;
  onUpdateProject?(): void;
}

export interface TimerService {
  fetchCurrentEntry(): Promise<Either<TogowlError, Entry | null>>;
  stopEntry(entry: Entry): Promise<Either<TogowlError, Entry>>;
  fetchEntries(since: DateTime): Promise<Either<TogowlError, Entry[]>>;
  fetchProjects(): Promise<Either<TogowlError, Project[]>>;
  terminate(): void;
}
