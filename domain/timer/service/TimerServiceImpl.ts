import _ from 'lodash';
import { TogowlError } from '~/domain/common/TogowlError';
import { Entry } from '~/domain/timer/vo/Entry';
import { Either, fold, left, right } from '~/node_modules/fp-ts/lib/Either';
import { TimerEventListener, TimerService } from '~/domain/timer/service/TimerService';
import * as toggl from '~/external/toggl';
import logger from '~/utils/global-logger';
import { Project } from '~/domain/timer/entity/Project';
import { ProjectId } from '~/domain/timer/vo/ProjectId';
import { ProjectName } from '~/domain/timer/vo/ProjectlName';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';

export class TimerServiceImpl implements TimerService {
  private restClient: toggl.RestApi.Client;
  private socketClient: toggl.SocketApi.Client;
  private readonly workspaceId: number;

  private projectById: { [projectId: string]: Project } = {};

  constructor(togglToken: string, listener: TimerEventListener, workspaceId: number, proxy?: string) {
    this.restClient = new toggl.RestApi.Client(togglToken, proxy);
    this.workspaceId = workspaceId;
    // XXX: FIXME:
    if (this.workspaceId) {
      this.fetchProjects().then(errOrProjects => {
        pipe(
          errOrProjects,
          fold(
            err => listener.onError?.(err),
            projects => {
              this.projectById = _.keyBy(projects, x => x.id.value);
              listener.onUpdateProject?.();
            },
          ),
        );
      });
    }

    // TODO: subscribe project changed
    this.socketClient = toggl.SocketApi.Client.use(togglToken, {
      onOpen: () => {
        logger.put('TimerServiceImpl.onOpen');
        listener.onStartSubscribe?.();
      },
      onClose: event => {
        logger.put('TimerServiceImpl.onClose');
        logger.put(`[Code] ${event.code}`);
        logger.put(`[Reason] ${event.reason}`);
        listener.onEndSubscribe?.();
      },
      onError: event => {
        logger.put('TimerServiceImpl.onError');
        logger.put(`[Code] ${event.code}`);
        logger.put(`[Reason] ${event.reason}`);
        listener.onError?.(TogowlError.create('SUBSCRIBE_TIMER_ERROR', 'Fail to subscribe timer event', event.reason));
      },
      onInsertEntry: entry => {
        logger.put('TimerServiceImpl.onInsertEntry');
        listener.onInsertEntry?.(this.transformEntry(entry));
      },
      onUpdateEntry: entry => {
        logger.put('TimerServiceImpl.onUpdateEntry');
        listener.onUpdateEntry?.(this.transformEntry(entry));
      },
      onDeleteEntry: entry => {
        logger.put('TimerServiceImpl.onDeleteEntry');
        listener.onDeleteEntry?.(this.transformEntry(entry));
      },
      onResponsePing: () => logger.put('TimerServiceImpl.onResponsePing'),
    });
  }

  async fetchCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    try {
      const entry = (await this.restClient.timeEntryCurrent()).data;
      return right(entry ? this.transformEntry(entry) : null);
    } catch (err) {
      return left(TogowlError.create('FETCH_CURRENT_ENTRY', "Can't fetch current entry from Toggl", err.message));
    }
  }

  async stopEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    try {
      const afterEntry = (await this.restClient.timeEntryStop(entry.id.asNumber)).data;
      return right(this.transformEntry(afterEntry));
    } catch (err) {
      return left(TogowlError.create('STOP_CURRENT_ENTRY', "Can't stop current entry from Toggl", err.message));
    }
  }

  async fetchProjects(): Promise<Either<TogowlError, Project[]>> {
    try {
      const projects = await this.restClient.projects(this.workspaceId);
      return right(projects.map(this.transformProject));
    } catch (err) {
      return left(TogowlError.create('FETCH_PROJECTS', "Can't fetch projects from Toggl", err.message));
    }
  }

  private transformEntry(entry: toggl.TimeEntry): Entry {
    return Entry.create(entry.id, entry.description, entry.start, entry.duration, this.projectById[entry.pid]);
  }

  private transformProject(project: toggl.Project): Project {
    return new Project(ProjectId.create(project.id), ProjectName.create(project.name));
  }
}
