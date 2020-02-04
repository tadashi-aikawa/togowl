import _ from 'lodash';
import { TogowlError } from '~/domain/common/TogowlError';
import { Entry, PartialEntry } from '~/domain/timer/entity/Entry';
import { Either, left, right } from '~/node_modules/fp-ts/lib/Either';
import { TimerEventListener, TimerService } from '~/domain/timer/service/TimerService';
import * as toggl from '~/external/toggl';
import logger from '~/utils/global-logger';
import { Project } from '~/domain/timer/entity/Project';
import { ProjectId } from '~/domain/timer/vo/ProjectId';
import { ProjectName } from '~/domain/timer/vo/ProjectlName';
import { ProjectCategory } from '~/domain/timer/entity/ProjectCategory';
import { ProjectCategoryId } from '~/domain/timer/vo/ProjectCategoryId';
import { ProjectCategoryName } from '~/domain/timer/vo/ProjectCategoryName';
import { DateTime } from '~/domain/common/DateTime';

export class TimerServiceImpl implements TimerService {
  private restClient: toggl.RestApi.ApiClient;
  private socketClient: toggl.SocketApi.ApiClient;
  private readonly workspaceId: number;

  constructor(togglToken: string, listener: TimerEventListener, workspaceId: number, proxy?: string) {
    logger.put('TimerCI.constructor');

    this.restClient = new toggl.RestApi.ApiClient(togglToken, proxy);
    this.workspaceId = workspaceId;

    this.socketClient = toggl.SocketApi.ApiClient.use(togglToken, {
      onOpen: () => {
        logger.put('TimerCI.onOpen');
        listener.onStartSubscribe?.();
      },
      onClose: event => {
        logger.put('TimerCI.onClose');
        logger.put(`[Code] ${event.code}`);
        logger.put(`[Reason] ${event.reason}`);
        listener.onEndSubscribe?.();
      },
      onError: event => {
        logger.put('TimerCI.onError');
        listener.onError?.(TogowlError.create('SUBSCRIBE_TIMER_ERROR', 'Fail to subscribe timer event', event.reason));
      },
      onInsertEntry: entry => {
        logger.put('TimerCI.onInsertEntry');
        listener.onInsertEntry?.(this.transformEntry(entry));
      },
      onUpdateEntry: entry => {
        logger.put('TimerCI.onUpdateEntry');
        listener.onUpdateEntry?.(this.transformEntry(entry));
      },
      onDeleteEntry: entry => {
        logger.put('TimerCI.onDeleteEntry');
        listener.onDeleteEntry?.(this.transformEntry(entry));
      },
      onUpdateProject: _project => {
        logger.put('TimerCI.onUpdateProject');
        listener.onUpdateProject?.();
      },
      onDeleteProject: _project => {
        logger.put('TimerCI.onDeleteProject');
        listener.onUpdateProject?.();
      },
      onUpdateClient: _client => {
        logger.put('TimerCI.onUpdateClient');
        listener.onUpdateProject?.();
      },
      onDeleteClient: _client => {
        logger.put('TimerCI.onDeleteClient');
        listener.onUpdateProject?.();
      },
      onResponsePing: () => logger.put('TimerCI.onResponsePing'),
    });
  }

  terminate() {
    logger.put('TimerCI.terminate');
    this.socketClient.terminate();
  }

  private async _fetchCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    try {
      const entry = (await this.restClient.timeEntryCurrent()).data;
      logger.put('TimerCI.fetchCurrentEntry.success');
      return right(entry ? this.transformEntry(entry) : null);
    } catch (err) {
      logger.put('TimerCI.fetchCurrentEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('FETCH_CURRENT_ENTRY', "Can't fetch current entry from Toggl", err.message));
    }
  }

  private throttleFetchCurrentEntry = _.throttle(this._fetchCurrentEntry, 1000, { trailing: false });
  fetchCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    return this.throttleFetchCurrentEntry();
  }

  async startEntry(description: string, project?: Project): Promise<Either<TogowlError, Entry>> {
    try {
      const startedEntry = (await this.restClient.timeEntryStart(description, project?.id.asNumber)).data;
      logger.put('TimerCI.startEntry.success');
      return right(this.transformEntry(startedEntry));
    } catch (err) {
      logger.put('TimerCI.startEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('START_ENTRY', "Can't start entry from Toggl", err.message));
    }
  }

  async updateEntry(entry: Entry, value: PartialEntry): Promise<Either<TogowlError, Entry>> {
    try {
      const updatedEntry = (
        await this.restClient.timeEntryUpdate(entry.id.asNumber, this.transformPartialTimeEntry(value))
      ).data;
      logger.put('TimerCI.updateEntry.success');
      return right(this.transformEntry(updatedEntry));
    } catch (err) {
      logger.put('TimerCI.updateEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('UPDATE_ENTRY', "Can't update entry from Toggl", err.message));
    }
  }

  async stopEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    try {
      const afterEntry = (await this.restClient.timeEntryStop(entry.id.asNumber)).data;
      logger.put('TimerCI.stopEntry.success');
      return right(this.transformEntry(afterEntry));
    } catch (err) {
      logger.put('TimerCI.stopEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('STOP_CURRENT_ENTRY', "Can't stop entry from Toggl", err.message));
    }
  }

  async deleteEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    try {
      await this.restClient.timeEntryDelete(entry.id.asNumber);
      logger.put('TimerCI.deleteEntry.success');
      return right(entry);
    } catch (err) {
      logger.put('TimerCI.deleteEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('DELETE_CURRENT_ENTRY', "Can't delete entry from Toggl", err.message));
    }
  }

  async _fetchEntries(since: DateTime): Promise<Either<TogowlError, Entry[]>> {
    try {
      const entries = await this.restClient.entries(since.rfc3339);
      logger.put('TimerCI.fetchEntries.success');
      return right(entries.map(e => this.transformEntry(e)));
    } catch (err) {
      logger.put('TimerCI.fetchEntries.err');
      logger.put(err.message);
      return left(TogowlError.create('FETCH_ENTRIES', "Can't fetch entries from Toggl", err.message));
    }
  }

  private throttleFetchEntries = _.throttle(this._fetchEntries, 1000, { trailing: false });

  fetchEntries(since: DateTime): Promise<Either<TogowlError, Entry[]>> {
    return this.throttleFetchEntries(since);
  }

  async fetchProjects(): Promise<Either<TogowlError, Project[]>> {
    try {
      const [projects, clients] = await Promise.all([
        this.restClient.projects(this.workspaceId),
        this.restClient.clients(this.workspaceId),
      ]);
      logger.put('TimerCI.fetchProjects.success');
      return right(
        projects.map((x: toggl.Project) =>
          this.transformProject(
            x,
            _(clients)
              .map(this.transformProjectCategory)
              .keyBy(x => x.id.value)
              .value(),
          ),
        ),
      );
    } catch (err) {
      logger.put('TimerCI.fetchProjects.err');
      logger.put(err.message);
      return left(TogowlError.create('FETCH_PROJECTS', "Can't fetch projects from Toggl", err.message));
    }
  }

  private transformEntry(entry: toggl.TimeEntry): Entry {
    return Entry.create({
      id: entry.id,
      description: entry.description,
      start: entry.start,
      stop: entry.stop,
      duration: entry.duration,
      _projectId: entry.pid ? ProjectId.create(entry.pid) : undefined,
    });
  }

  private transformPartialTimeEntry(entry: PartialEntry): Partial<toggl.TimeEntry> {
    return {
      pid: entry.project?.id.asNumber,
      start: entry.start?.rfc3339,
      stop: entry.stop?.rfc3339,
      duration: entry.duration?.value,
      description: entry.description,
    };
  }

  private transformProjectCategory(client: toggl.Client): ProjectCategory {
    return new ProjectCategory(ProjectCategoryId.create(client.id), ProjectCategoryName.create(client.name));
  }

  private transformProject(
    project: toggl.Project,
    projectCategoryById: { [projectCategoryId: string]: ProjectCategory },
  ): Project {
    return new Project(
      ProjectId.create(project.id),
      ProjectName.create(project.name),
      undefined,
      project.cid ? projectCategoryById[project.cid] : undefined,
    );
  }
}
