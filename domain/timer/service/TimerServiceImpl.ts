import _ from 'lodash';
import { TogowlError } from '~/domain/common/TogowlError';
import { Entry, PartialEntry } from '~/domain/timer/entity/Entry';
import { Either, fold, left, right } from '~/node_modules/fp-ts/lib/Either';
import { TimerEventListener, TimerService } from '~/domain/timer/service/TimerService';
import * as toggl from '~/external/toggl';
import logger from '~/utils/global-logger';
import { Project } from '~/domain/timer/entity/Project';
import { ProjectId } from '~/domain/timer/vo/ProjectId';
import { ProjectName } from '~/domain/timer/vo/ProjectlName';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { ProjectCategory } from '~/domain/timer/entity/ProjectCategory';
import { ProjectCategoryId } from '~/domain/timer/vo/ProjectCategoryId';
import { ProjectCategoryName } from '~/domain/timer/vo/ProjectCategoryName';
import { DateTime } from '~/domain/common/DateTime';

export class TimerServiceImpl implements TimerService {
  private restClient: toggl.RestApi.ApiClient;
  private socketClient: toggl.SocketApi.ApiClient;
  private readonly workspaceId: number;

  private projectById: { [projectId: string]: Project } = {};

  constructor(togglToken: string, listener: TimerEventListener, workspaceId: number, proxy?: string) {
    logger.put('TSI.constructor');

    this.restClient = new toggl.RestApi.ApiClient(togglToken, proxy);
    this.workspaceId = workspaceId;

    this.updateProjectById(listener);

    // TODO: subscribe project changed
    this.socketClient = toggl.SocketApi.ApiClient.use(togglToken, {
      onOpen: () => {
        logger.put('TSI.onOpen');
        listener.onStartSubscribe?.();
      },
      onClose: event => {
        logger.put('TSI.onClose');
        logger.put(`[Code] ${event.code}`);
        logger.put(`[Reason] ${event.reason}`);
        listener.onEndSubscribe?.();
      },
      onError: event => {
        logger.put('TSI.onError');
        listener.onError?.(TogowlError.create('SUBSCRIBE_TIMER_ERROR', 'Fail to subscribe timer event', event.reason));
      },
      onInsertEntry: entry => {
        logger.put('TSI.onInsertEntry');
        listener.onInsertEntry?.(this.transformEntry(entry));
      },
      onUpdateEntry: entry => {
        logger.put('TSI.onUpdateEntry');
        listener.onUpdateEntry?.(this.transformEntry(entry));
      },
      onDeleteEntry: entry => {
        logger.put('TSI.onDeleteEntry');
        listener.onDeleteEntry?.(this.transformEntry(entry));
      },
      onUpdateProject: _project => {
        logger.put('TSI.onUpdateProject');
        this.updateProjectById(listener);
      },
      onDeleteProject: _project => {
        logger.put('TSI.onDeleteProject');
        this.updateProjectById(listener);
      },
      onUpdateClient: _client => {
        logger.put('TSI.onUpdateClient');
        this.updateProjectById(listener);
      },
      onDeleteClient: _client => {
        logger.put('TSI.onDeleteClient');
        this.updateProjectById(listener);
      },
      onResponsePing: () => logger.put('TSI.onResponsePing'),
    });
  }

  terminate() {
    logger.put('TSI.terminate');
    this.socketClient.terminate();
  }

  private updateProjectById(listener: TimerEventListener): Promise<TogowlError | null> {
    if (!this.workspaceId) {
      logger.put('WORKSPACE_ID_IS_EMPTY');
      return Promise.resolve(TogowlError.create('WORKSPACE_ID_IS_EMPTY', 'Toggl workspaceID is empty.'));
    }

    return this.fetchProjects().then(errOrProjects =>
      pipe(
        errOrProjects,
        fold(
          err => {
            listener.onError?.(err);
            return null;
          },
          projects => {
            this.projectById = _.keyBy(projects, x => x.id.value);
            listener.onUpdateProject?.();
            return null;
          },
        ),
      ),
    );
  }

  private async _fetchCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    try {
      const entry = (await this.restClient.timeEntryCurrent()).data;
      logger.put('TSI.fetchCurrentEntry.success');
      return right(entry ? this.transformEntry(entry) : null);
    } catch (err) {
      logger.put('TSI.fetchCurrentEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('FETCH_CURRENT_ENTRY', "Can't fetch current entry from Toggl", err.message));
    }
  }

  private throttleFetchCurrentEntry = _.throttle(this._fetchCurrentEntry, 1000, { trailing: false });

  fetchCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    return this.throttleFetchCurrentEntry();
  }

  async startEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    try {
      const startedEntry = (await this.restClient.timeEntryStart(entry.description, entry.project?.id.asNumber)).data;
      logger.put('TSI.startEntry.success');
      return right(this.transformEntry(startedEntry));
    } catch (err) {
      logger.put('TSI.startEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('START_ENTRY', "Can't start entry from Toggl", err.message));
    }
  }

  async updateEntry(entry: Entry, value: PartialEntry): Promise<Either<TogowlError, Entry>> {
    try {
      const updatedEntry = (
        await this.restClient.timeEntryUpdate(entry.id.asNumber, this.transformPartialTimeEntry(value))
      ).data;
      logger.put('TSI.updateEntry.success');
      return right(this.transformEntry(updatedEntry));
    } catch (err) {
      logger.put('TSI.updateEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('UPDATE_ENTRY', "Can't update entry from Toggl", err.message));
    }
  }

  async stopEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    try {
      const afterEntry = (await this.restClient.timeEntryStop(entry.id.asNumber)).data;
      logger.put('TSI.stopEntry.success');
      return right(this.transformEntry(afterEntry));
    } catch (err) {
      logger.put('TSI.stopEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('STOP_CURRENT_ENTRY', "Can't stop entry from Toggl", err.message));
    }
  }

  async deleteEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    try {
      await this.restClient.timeEntryDelete(entry.id.asNumber);
      logger.put('TSI.deleteEntry.success');
      return right(entry);
    } catch (err) {
      logger.put('TSI.deleteEntry.err');
      logger.put(err.message);
      return left(TogowlError.create('DELETE_CURRENT_ENTRY', "Can't delete entry from Toggl", err.message));
    }
  }

  async _fetchEntries(since: DateTime): Promise<Either<TogowlError, Entry[]>> {
    try {
      const entries = await this.restClient.entries(since.rfc3339);
      logger.put('TSI.fetchEntries.success');
      return right(entries.map(e => this.transformEntry(e)));
    } catch (err) {
      logger.put('TSI.fetchEntries.err');
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
      logger.put('TSI.fetchProjects.success');
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
      logger.put('TSI.fetchProjects.err');
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
      project: entry.pid ? this.projectById[entry.pid] : undefined,
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
