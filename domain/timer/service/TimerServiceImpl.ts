import _ from "lodash";
import { Either, left, right } from "owlelia";
import { Entry, PartialEntry } from "~/domain/timer/entity/Entry";
import {
  TimerEventListener,
  TimerService,
} from "~/domain/timer/service/TimerService";
import * as toggl from "~/external/toggl";
import logger from "~/utils/global-logger";
import { Project } from "~/domain/timer/entity/Project";
import { ProjectId } from "~/domain/timer/vo/ProjectId";
import { ProjectName } from "~/domain/timer/vo/ProjectlName";
import { ProjectCategory } from "~/domain/timer/entity/ProjectCategory";
import { ProjectCategoryId } from "~/domain/timer/vo/ProjectCategoryId";
import { ProjectCategoryName } from "~/domain/timer/vo/ProjectCategoryName";
import { DateTime } from "~/domain/common/DateTime";
import { FetchCurrentEntryError } from "~/domain/timer/vo/FetchCurrentEntryError";
import { StartEntryError } from "~/domain/timer/vo/StartEntryError";
import { UpdateEntryError } from "~/domain/timer/vo/UpdateEntryError";
import { StopEntryError } from "~/domain/timer/vo/StopEntryError";
import { DeleteEntryError } from "~/domain/timer/vo/DeleteEntryError";
import { FetchEntriesError } from "~/domain/timer/vo/FetchEntriesError";
import { FetchProjectsError } from "~/domain/timer/vo/FetchProjectsError";
import { SubscribeTimerError } from "~/domain/timer/vo/SubscribeTimerError";
import { EntryId } from "~/domain/timer/vo/EntryId";
import { Duration } from "~/domain/timer/vo/Duration";

export class TimerServiceImpl implements TimerService {
  private restClient: toggl.RestApi.ApiClient;
  private socketClient: toggl.SocketApi.ApiClient;
  private readonly workspaceId: number;

  constructor(
    togglToken: string,
    listener: TimerEventListener,
    workspaceId: number,
    proxy?: string
  ) {
    logger.put("new TimerService");

    this.restClient = new toggl.RestApi.ApiClient(togglToken, proxy);
    this.workspaceId = workspaceId;

    this.socketClient = toggl.SocketApi.ApiClient.use(togglToken, {
      onOpen: () => {
        logger.put("TimerService.onOpen");
        listener.onStartSubscribe?.();
      },
      onClose: (event) => {
        logger.put(`TimerService.onClose: ${event.code}`);
        listener.onEndSubscribe?.();
      },
      onError: (event) => {
        logger.put("TimerService.onError");
        listener.onError?.(
          SubscribeTimerError.of({
            message: event.reason,
          })
        );
      },
      onInsertEntry: (entry) => {
        logger.put("TimerService.onInsertEntry");
        listener.onInsertEntry?.(this.transformEntry(entry));
      },
      onUpdateEntry: (entry) => {
        logger.put("TimerService.onUpdateEntry");
        listener.onUpdateEntry?.(this.transformEntry(entry));
      },
      onDeleteEntry: (entry) => {
        logger.put("TimerService.onDeleteEntry");
        listener.onDeleteEntry?.(this.transformEntry(entry));
      },
      onUpdateProject: (_project) => {
        logger.put("TimerService.onUpdateProject");
        listener.onUpdateProject?.();
      },
      onDeleteProject: (_project) => {
        logger.put("TimerService.onDeleteProject");
        listener.onUpdateProject?.();
      },
      onUpdateClient: (_client) => {
        logger.put("TimerService.onUpdateClient");
        listener.onUpdateProject?.();
      },
      onDeleteClient: (_client) => {
        logger.put("TimerService.onDeleteClient");
        listener.onUpdateProject?.();
      },
      onResponsePing: () => {},
    });
  }

  terminate() {
    logger.put("TimerService.terminate");
    this.socketClient.terminate();
  }

  private async _fetchCurrentEntry(): Promise<
    Either<FetchCurrentEntryError, Entry | null>
  > {
    try {
      const entry = (await this.restClient.timeEntryCurrent()).data;
      logger.put("TimerService.fetchCurrentEntry.success");
      return right(entry ? this.transformEntry(entry) : null);
    } catch (err: any) {
      logger.put("TimerService.fetchCurrentEntry.err");
      logger.put(err.message);
      return left(FetchCurrentEntryError.of());
    }
  }

  private throttleFetchCurrentEntry = _.throttle(
    this._fetchCurrentEntry,
    1000,
    { trailing: false }
  );

  fetchCurrentEntry(): Promise<Either<FetchCurrentEntryError, Entry | null>> {
    return this.throttleFetchCurrentEntry()!;
  }

  async startEntry(
    description: string,
    project?: Project
  ): Promise<Either<StartEntryError, Entry>> {
    try {
      const startedEntry = (
        await this.restClient.timeEntryStart(description, project?.id.asNumber)
      ).data;
      logger.put("TimerService.startEntry.success");
      return right(this.transformEntry(startedEntry));
    } catch (err: any) {
      logger.put("TimerService.startEntry.err");
      logger.put(err.message);
      return left(
        StartEntryError.of({
          title: description,
          project,
        })
      );
    }
  }

  async updateEntry(
    entry: Entry,
    value: PartialEntry
  ): Promise<Either<UpdateEntryError, Entry>> {
    try {
      const updatedEntry = (
        await this.restClient.timeEntryUpdate(
          entry.id.asNumber,
          this.transformPartialTimeEntry(value)
        )
      ).data;
      logger.put("TimerService.updateEntry.success");
      return right(this.transformEntry(updatedEntry));
    } catch (err: any) {
      logger.put("TimerService.updateEntry.err");
      logger.put(err.message);
      return left(
        UpdateEntryError.of({
          title: entry.description,
          project: entry.project,
        })
      );
    }
  }

  async stopEntry(entry: Entry): Promise<Either<StopEntryError, Entry>> {
    try {
      const afterEntry = (
        await this.restClient.timeEntryStop(entry.id.asNumber)
      ).data;
      logger.put("TimerService.stopEntry.success");
      return right(this.transformEntry(afterEntry));
    } catch (err: any) {
      logger.put("TimerService.stopEntry.err");
      logger.put(err.message);
      return left(
        StopEntryError.of({
          title: entry.description,
          project: entry.project,
        })
      );
    }
  }

  async deleteEntry(entry: Entry): Promise<Either<DeleteEntryError, Entry>> {
    try {
      await this.restClient.timeEntryDelete(entry.id.asNumber);
      logger.put("TimerService.deleteEntry.success");
      return right(entry);
    } catch (err: any) {
      logger.put("TimerService.deleteEntry.err");
      logger.put(err.message);
      return left(
        DeleteEntryError.of({
          title: entry.description,
          project: entry.project,
        })
      );
    }
  }

  async _fetchEntries(
    since: DateTime
  ): Promise<Either<FetchEntriesError, Entry[]>> {
    try {
      const entries = await this.restClient.entries(since.rfc3339);
      logger.put("TimerService.fetchEntries.success");
      return right(entries.map((e) => this.transformEntry(e)));
    } catch (err: any) {
      logger.put("TimerService.fetchEntries.err");
      logger.put(err.message);
      return left(
        FetchEntriesError.of({
          detail: `since ${since.displayDateTime}.`,
        })
      );
    }
  }

  private throttleFetchEntries = _.throttle(this._fetchEntries, 1000, {
    trailing: false,
  });

  fetchEntries(since: DateTime): Promise<Either<FetchEntriesError, Entry[]>> {
    return this.throttleFetchEntries(since)!;
  }

  async fetchProjects(): Promise<Either<FetchProjectsError, Project[]>> {
    try {
      const [projects, clients] = await Promise.all([
        this.restClient.projects(this.workspaceId),
        this.restClient.clients(this.workspaceId),
      ]);
      logger.put("TimerService.fetchProjects.success");
      return right(
        projects.map((x: toggl.Project) =>
          this.transformProject(
            x,
            _(clients)
              .map(this.transformProjectCategory)
              .keyBy((x) => x.id.unwrap())
              .value()
          )
        )
      );
    } catch (err: any) {
      logger.put("TimerService.fetchProjects.err");
      logger.put(err.message);
      return left(FetchProjectsError.of());
    }
  }

  private transformEntry(entry: toggl.TimeEntry): Entry {
    return Entry.of({
      id: EntryId.of(entry.id),
      description: entry.description,
      start: DateTime.of(entry.start),
      stop: entry.stop ? DateTime.of(entry.stop) : undefined,
      duration: Duration.of(entry.duration),
      _projectId: entry.pid ? ProjectId.of(entry.pid) : undefined,
    });
  }

  private transformPartialTimeEntry(
    entry: PartialEntry
  ): Partial<toggl.TimeEntry> {
    return {
      pid: entry.project?.id.asNumber,
      start: entry.start?.rfc3339,
      stop: entry.stop?.rfc3339,
      duration: entry.duration?.unwrap(),
      description: entry.description,
    };
  }

  private transformProjectCategory(client: toggl.Client): ProjectCategory {
    return ProjectCategory.of({
      id: ProjectCategoryId.of(client.id),
      name: ProjectCategoryName.of(client.name),
    });
  }

  private transformProject(
    project: toggl.Project,
    projectCategoryById: { [projectCategoryId: string]: ProjectCategory }
  ): Project {
    return Project.of({
      id: ProjectId.of(project.id),
      name: ProjectName.of(project.name),
      category: project.cid ? projectCategoryById[project.cid] : undefined,
    });
  }
}
