import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import _ from 'lodash';
import { Dictionary } from 'lodash';
import { UId } from '~/domain/authentication/vo/UId';
import { TogowlError } from '~/domain/common/TogowlError';
import { TimerService } from '~/domain/timer/service/TimerService';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { Either, fold, left, right } from '~/node_modules/fp-ts/lib/Either';
import { Entry } from '~/domain/timer/entity/Entry';
import { createTimerService } from '~/utils/service-factory';
import {
  FirestoreProject,
  FirestoreProjectCategory,
  FirestoreTimer,
  toProjectCategoryConfig,
  toProjectConfig,
  toTimerConfig,
} from '~/repository/FirebaseCloudRepository';
import { cloudRepository } from '~/store/index';
import { ActionStatus } from '~/domain/common/ActionStatus';
import { DateTime } from '~/domain/common/DateTime';
import { createAction } from '~/utils/firestore-facade';
import { ProjectConfig } from '~/domain/timer/vo/ProjectConfig';
import { ProjectCategoryConfig } from '~/domain/timer/vo/ProjectCategoryConfig';
import { Project } from '~/domain/timer/entity/Project';
import { ProjectCategory } from '~/domain/timer/entity/ProjectCategory';
import { ProjectId as TaskProjectId } from '~/domain/task/vo/ProjectId';

let service: TimerService | null;

const MAX_HISTORY_DAYS = 10;

function addMetaToProjectCategory(
  projectCategory: ProjectCategory,
  projectCategoryConfig: ProjectCategoryConfig | null,
): ProjectCategory {
  return projectCategory.cloneWith(projectCategoryConfig?.getIcon(projectCategory.id));
}

function addMetaToProject(
  project: Project,
  projectConfig: ProjectConfig | null,
  projectCategoryConfig: ProjectCategoryConfig | null,
): Project {
  return project.cloneWith(
    projectConfig?.getIcon(project.id),
    project.category ? addMetaToProjectCategory(project.category, projectCategoryConfig) : undefined,
    projectConfig?.getTaskProjectIds(project.id),
  );
}

function addMetaToEntry(entry: Entry, projectById: { [projectId: number]: Project }): Entry {
  return entry.cloneWithProject(entry._projectId ? projectById[entry._projectId.asNumber] : undefined);
}

/**
 * Concrete implementation by using firebase
 */
@Module({ name: 'Timer', namespaced: true, stateFactory: true })
class TimerModule extends VuexModule {
  private _timer: FirestoreTimer | null = null;
  private _project: FirestoreProject | null = null;
  private _projectCategory: FirestoreProjectCategory | null = null;

  get timerConfig(): TimerConfig | null {
    return this._timer ? toTimerConfig(this._timer) : null;
  }

  get projectConfig(): ProjectConfig | null {
    return this._project ? toProjectConfig(this._project) : null;
  }

  get projectCategoryConfig(): ProjectCategoryConfig | null {
    return this._projectCategory ? toProjectCategoryConfig(this._projectCategory) : null;
  }

  get currentEntry(): Entry | null {
    return this._currentEntry ? addMetaToEntry(this._currentEntry, this.projectById) : null;
  }

  get entries(): Entry[] {
    return Object.values(this._entryById).map(e => addMetaToEntry(e, this.projectById)) ?? [];
  }

  get entriesWithinDay(): Entry[] {
    return _(this.entries)
      .filter(e => e.stop?.within(24 * 60 * 60) ?? false)
      .orderBy(e => e.start.unix, 'desc')
      .value();
  }

  get previousEntry(): Entry | undefined {
    return this.entriesWithinDay?.[0];
  }

  get candidatedEntries(): Entry[] {
    return _(this.entries)
      .groupBy(x => x.hashAsTask)
      .values()
      .orderBy(es => es.length, 'desc')
      .map(es => es[0])
      .value();
  }

  get projects(): Project[] {
    return this._projects?.map(p => addMetaToProject(p, this.projectConfig, this.projectCategoryConfig)) ?? [];
  }

  get projectById(): { [projectId: number]: Project } {
    return _.keyBy(this.projects, p => p.id.asNumber);
  }

  get projectsGroupByCategory(): Dictionary<Project[]> {
    return _(this.projects)
      .reject(p => !p.category)
      .groupBy(p => p.category?.id.value)
      .value();
  }

  // FIXME: extract
  get projectByTaskProjectId(): { [taskProjectId: number]: Project } {
    return _(this.projects)
      .flatMap(pj => pj.taskProjectIds?.map(tpid => [tpid.value, pj]) ?? [])
      .fromPairs()
      .value();
  }

  updateStatus: ActionStatus = 'init';
  @Mutation
  setUpdateStatus(status: ActionStatus) {
    this.updateStatus = status;
  }

  updateError: TogowlError | null = null;
  @Mutation
  setUpdateError(error: TogowlError | null) {
    this.updateError = error;
  }

  realtime: boolean = false;
  @Mutation
  setRealtime(realtime: boolean) {
    this.realtime = realtime;
  }

  private _currentEntry: Entry | null = null;
  @Mutation
  setCurrentEntry(entry: Entry | null) {
    this._currentEntry = entry;
  }

  fetchingStatus: ActionStatus = 'init';
  @Mutation
  setFetchingStatus(status: ActionStatus) {
    this.fetchingStatus = status;
  }

  fetchingError: TogowlError | null = null;
  @Mutation
  setFetchingError(error: TogowlError | null) {
    this.fetchingError = error;
  }

  private _entryById: { [entryId: number]: Entry } = {};
  @Mutation
  setEntryById(entryById: { [entryId: number]: Entry }) {
    this._entryById = entryById;
  }

  entryByIdStatus: ActionStatus = 'init';
  @Mutation
  setEntryByIdStatus(status: ActionStatus) {
    this.entryByIdStatus = status;
  }

  entryByIdError: TogowlError | null = null;
  @Mutation
  setEntryByIdError(error: TogowlError | null) {
    this.entryByIdError = error;
  }

  private _projects: Project[] | null = null;
  @Mutation
  setProjects(projects: Project[] | null) {
    this._projects = projects;
  }

  projectsStatus: ActionStatus = 'init';
  @Mutation
  setProjectsStatus(status: ActionStatus) {
    this.projectsStatus = status;
  }

  projectsError: TogowlError | null = null;
  @Mutation
  setProjectsError(error: TogowlError | null) {
    this.projectsError = error;
  }

  @Action
  async updateTimerConfig(config: TimerConfig) {
    this.setUpdateError(null);
    this.setUpdateStatus('in_progress');

    // TODO: Recreate service?
    const err = await cloudRepository.saveTimerConfig(config);
    if (err) {
      this.setUpdateStatus('error');
      this.setUpdateError(err);
    } else {
      await this.updateService();
      this.setUpdateStatus('success');
    }
  }

  @Action({ rawError: true })
  async updateProject(project: Project) {
    // TODO: status
    const err = await cloudRepository.saveProjectConfig(this.projectConfig!.cloneWith(project.id, project.icon));
    if (err) {
      // TODO: Show on UI
      console.error('Failure to updateProject');
    }
  }

  @Action({ rawError: true })
  async updateProjectCategory(projectCategory: ProjectCategory) {
    // TODO: status
    const err = await cloudRepository.saveProjectCategoryConfig(
      this.projectCategoryConfig!.cloneWith(projectCategory.id, projectCategory.icon),
    );
    if (err) {
      // TODO: Show on UI
      console.error('Failure to updateProjectCategory');
    }
  }

  @Action
  async fetchCurrentEntry(): Promise<void> {
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      console.error('Token for timer is required! It is empty!');
      return;
    }

    this.setFetchingStatus('in_progress');
    pipe(
      await service!.fetchCurrentEntry(),
      fold(
        err => {
          this.setFetchingError(err);
          this.setCurrentEntry(null);
          this.setFetchingStatus('error');
        },
        entry => {
          this.setCurrentEntry(entry);
          this.setFetchingError(null);
          this.setFetchingStatus('success');
        },
      ),
    );
  }

  @Action
  async startEntry(entry: Entry): Promise<Either<TogowlError, Entry>> {
    if (!this.timerConfig?.token) {
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    return pipe(
      await service!.startEntry(entry),
      fold(
        err => {
          this.setCurrentEntry(null);
          return left(err);
        },
        entry => {
          this.setCurrentEntry(entry);
          return right(addMetaToEntry(entry, this.projectById));
        },
      ),
    );
  }

  @Action
  async completeCurrentEntry(): Promise<Either<TogowlError, Entry>> {
    // TODO: Complete Todoist task and Add complete tag to toggl entry
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    if (!this.currentEntry) {
      return left(TogowlError.create('CURRENT_ENTRY_IS_EMPTY', 'Current entry is empty!'));
    }

    return pipe(
      await service!.stopEntry(this.currentEntry),
      fold(
        err => {
          return left(err);
        },
        entry => {
          this.setCurrentEntry(null);
          return right(addMetaToEntry(entry, this.projectById));
        },
      ),
    );
  }

  @Action
  async pauseCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    // XXX: This action is similar to completeCurrentEntry but not same
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    if (!this.currentEntry) {
      return left(TogowlError.create('CURRENT_ENTRY_IS_EMPTY', 'Current entry is empty!'));
    }

    return pipe(
      await service!.stopEntry(this.currentEntry),
      fold(
        err => {
          return left(err);
        },
        entry => {
          this.setCurrentEntry(null);
          return right(addMetaToEntry(entry, this.projectById));
        },
      ),
    );
  }

  @Action
  async cancelCurrentEntry(): Promise<Either<TogowlError, Entry | null>> {
    // XXX: This action is similar to completeCurrentEntry but not same
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    if (!this.currentEntry) {
      return left(TogowlError.create('CURRENT_ENTRY_IS_EMPTY', 'Current entry is empty!'));
    }

    return pipe(
      await service!.deleteEntry(this.currentEntry),
      fold(
        err => {
          return left(err);
        },
        () => {
          const entry = this.currentEntry!;
          this.setCurrentEntry(null);
          return right(addMetaToEntry(entry, this.projectById));
        },
      ),
    );
  }

  @Action
  async connectPreviousEntry(): Promise<Either<TogowlError, Entry | null>> {
    // XXX: This action is similar to completeCurrentEntry but not same
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      return left(TogowlError.create('TIMER_TOKEN_IS_EMPTY', 'Token for timer is required! It is empty!'));
    }
    if (!this.currentEntry) {
      return left(TogowlError.create('CURRENT_ENTRY_IS_EMPTY', 'Current entry is empty!'));
    }
    if (!this.previousEntry) {
      return left(TogowlError.create('PREVIOUS_ENTRY_IS_EMPTY', 'Previous entry is empty!'));
    }

    return pipe(
      await service!.updateEntry(this.currentEntry, { start: this.previousEntry.stop?.plusSeconds(1) }),
      fold(
        err => {
          return left(err);
        },
        entry => {
          this.setCurrentEntry(entry);
          return right(addMetaToEntry(entry, this.projectById));
        },
      ),
    );
  }

  @Action
  async fetchEntries(): Promise<void> {
    // XXX: Show current tab state?
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      console.error('Token for timer is required! It is empty!');
      return;
    }

    this.setEntryByIdStatus('in_progress');
    pipe(
      await service!.fetchEntries(DateTime.now().minusDays(MAX_HISTORY_DAYS)),
      fold(
        err => {
          this.setEntryByIdError(err);
          this.setEntryByIdStatus('error');
        },
        entries => {
          this.setEntryById(_.keyBy(entries, x => x.id.asNumber));
          this.setEntryByIdError(null);
          this.setEntryByIdStatus('success');
        },
      ),
    );
  }

  @Action
  async fetchProjects(): Promise<void> {
    // XXX: Show current tab state?
    const config = this.timerConfig;
    if (!config?.token) {
      // TODO: Show on UI
      console.error('Token for timer is required! It is empty!');
      return;
    }

    this.setProjectsStatus('in_progress');
    pipe(
      await service!.fetchProjects(),
      fold(
        err => {
          this.setProjectsError(err);
          this.setProjectsStatus('error');
        },
        projects => {
          this.setProjects(projects);
          this.setProjectsError(null);
          this.setProjectsStatus('success');
        },
      ),
    );
  }

  @Action({ rawError: true })
  private async updateService(): Promise<void> {
    if (service) {
      service.terminate();
    }

    service = await createTimerService({
      onStartSubscribe: () => {
        this.setRealtime(true);
        this.fetchCurrentEntry();
        this.fetchEntries();
        this.fetchProjects();
      },
      onEndSubscribe: async () => {
        this.setRealtime(false);
        await this.updateService();
      },
      onError: this.setFetchingError,
      onInsertEntry: entry => {
        if (!this.currentEntry) {
          this.setCurrentEntry(entry);
        }
        this.setEntryById({ ...this._entryById, [entry.id.asNumber]: entry });
      },
      onUpdateEntry: entry => {
        if (this.currentEntry?.equals(entry)) {
          this.setCurrentEntry(entry.stop ? null : entry);
        }
        this.setEntryById({ ...this._entryById, [entry.id.asNumber]: entry });
      },
      onDeleteEntry: entry => {
        if (this.currentEntry?.equals(entry)) {
          this.setCurrentEntry(null);
        }
        this.setEntryById(_.omit(this._entryById, [entry.id.asNumber]));
      },
      onUpdateProject: () => {
        // TODO: Remove if partial update is implemented
        this.fetchProjects();
      },
    });
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.value, '_timer', 'timer')(this.context);
    createAction(uid.value, '_project', 'projects')(this.context);
    createAction(uid.value, '_projectCategory', 'projectCategories')(this.context);
    await this.updateService();
  }
}

export default TimerModule;
