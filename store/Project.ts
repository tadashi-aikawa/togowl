import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import _, { Dictionary } from "lodash";
import { UId } from "~/domain/authentication/vo/UId";
import { TogowlError } from "~/domain/common/TogowlError";
import { TimerService } from "~/domain/timer/service/TimerService";
import { createTimerService } from "~/utils/service-factory";
import {
  FirestoreProject,
  FirestoreProjectCategory,
  toProjectCategoryConfig,
  toProjectConfig,
} from "~/repository/FirebaseCloudRepository";
import { cloudRepository, taskStore } from "~/store/index";
import { ActionStatus } from "~/domain/common/ActionStatus";
import { createAction } from "~/utils/firestore-facade";
import { ProjectConfig } from "~/domain/timer/vo/ProjectConfig";
import { ProjectCategoryConfig } from "~/domain/timer/vo/ProjectCategoryConfig";
import { Project } from "~/domain/timer/entity/Project";
import { ProjectCategory } from "~/domain/timer/entity/ProjectCategory";
import { addMetaToProject } from "~/domain/timer/service/TimerMetaService";
import { TaskProject } from "~/domain/task/entity/TaskProject";
import { TaskProjectCountStorage } from "~/utils/local-storage";

let service: TimerService | null;

/**
 * Concrete implementation by using firebase
 */
@Module({ name: "Project", namespaced: true, stateFactory: true })
class ProjectModule extends VuexModule {
  private _project: FirestoreProject | null = null;
  private _projectCategory: FirestoreProjectCategory | null = null;

  get projectConfig(): ProjectConfig {
    return this._project
      ? toProjectConfig(this._project)
      : ProjectConfig.empty();
  }

  get projectCategoryConfig(): ProjectCategoryConfig {
    return this._projectCategory
      ? toProjectCategoryConfig(this._projectCategory)
      : ProjectCategoryConfig.empty();
  }

  get projects(): Project[] {
    return (
      this._projects?.map((p) =>
        addMetaToProject(p, this.projectConfig, this.projectCategoryConfig)
      ) ?? []
    );
  }

  get projectById(): { [projectId: number]: Project } {
    return _.keyBy(this.projects, (p) => p.id.asNumber);
  }

  get projectsGroupByCategory(): Dictionary<Project[]> {
    return _(this.projects)
      .reject((p) => !p.category)
      .groupBy((p) => p.category?.id.unwrap())
      .value();
  }

  // FIXME: extract
  get projectByTaskProjectId(): { [taskProjectId: number]: Project } {
    return _(this.projects)
      .flatMap((pj) => pj.taskProjectIds.map((tpid) => [tpid.unwrap(), pj]))
      .fromPairs()
      .value();
  }

  /**
   * Get only task projects related to timer projects.
   */
  get relatedTaskProjects(): TaskProject[] {
    return _(this.projects)
      .flatMap((x) => x.taskProjectIds)
      .uniq()
      .orderBy(
        (pid) => this.projectSelectedCountById[pid.asNumber] ?? 0,
        "desc"
      )
      .map((x) => taskStore.projectById[x.asNumber])
      .reject((x) => x === undefined)
      .value();
  }

  private _projects: Project[] | null = null;
  @Mutation
  setProjects(projects: Project[] | null) {
    this._projects = projects;
  }

  private projectsStatus: ActionStatus = "init";
  @Mutation
  setProjectsStatus(status: ActionStatus) {
    this.projectsStatus = status;
  }

  private projectsError: TogowlError | null = null;
  @Mutation
  setProjectsError(error: TogowlError | null) {
    this.projectsError = error;
  }

  private projectSelectedCountById: {
    [id: number]: number;
  } = TaskProjectCountStorage.getAll();

  @Mutation
  setProjectSelectedCountById(countById: { [id: number]: number }) {
    this.projectSelectedCountById = countById;
  }

  @Action({ rawError: true })
  async updateProject(project: Project) {
    // TODO: status
    const err = await cloudRepository.saveProjectConfig(
      this.projectConfig.cloneWith(
        project.id,
        project.icon,
        project.taskProjectIds
      )
    );
    if (err) {
      // TODO: Show on UI
      console.error("Failure to updateProject");
    }
  }

  @Action({ rawError: true })
  async updateProjectCategory(projectCategory: ProjectCategory) {
    // TODO: status
    const err = await cloudRepository.saveProjectCategoryConfig(
      this.projectCategoryConfig.cloneWith(projectCategory.id, {
        icon: projectCategory.icon,
        color: projectCategory.color,
      })
    );
    if (err) {
      // TODO: Show on UI
      console.error("Failure to updateProjectCategory");
    }
  }

  @Action({ rawError: true })
  async fetchProjects(): Promise<void> {
    if (!service) {
      return;
    }

    this.setProjectsStatus("in_progress");
    const projectsOrErr = await service.fetchProjects();
    if (projectsOrErr.isLeft()) {
      this.setProjectsError(projectsOrErr.error);
      this.setProjectsStatus("error");
      return;
    }

    this.setProjects(projectsOrErr.value);
    this.setProjectsError(null);
    this.setProjectsStatus("success");
  }

  @Action({ rawError: true })
  increaseProjectSelectedCount(project: TaskProject): void {
    this.setProjectSelectedCountById(
      TaskProjectCountStorage.increase(project.id.asNumber)
    );
  }

  @Action({ rawError: true })
  async updateService(): Promise<void> {
    if (service) {
      service.terminate();
    }

    service = await createTimerService({
      onStartSubscribe: () => {
        this.fetchProjects();
      },
      onEndSubscribe: async () => {
        await this.updateService();
      },
      onError: this.setProjectsError,
      onUpdateProject: () => {
        // TODO: Remove if partial update is implemented
        this.fetchProjects();
      },
    });
  }

  @Action({ rawError: true })
  async init(uid: UId) {
    createAction(uid.unwrap(), "_project", "projects")(this.context);
    createAction(
      uid.unwrap(),
      "_projectCategory",
      "projectCategories"
    )(this.context);
    await this.updateService();
  }
}

export default ProjectModule;
