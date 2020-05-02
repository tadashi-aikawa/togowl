import { ProjectCategory } from "~/domain/timer/entity/ProjectCategory";
import { ProjectCategoryConfig } from "~/domain/timer/vo/ProjectCategoryConfig";
import { Project } from "~/domain/timer/entity/Project";
import { ProjectConfig } from "~/domain/timer/vo/ProjectConfig";
import { Entry } from "~/domain/timer/entity/Entry";

export function addMetaToProjectCategory(
  projectCategory: ProjectCategory,
  projectCategoryConfig: ProjectCategoryConfig | null
): ProjectCategory {
  return projectCategory.cloneWith(
    projectCategoryConfig?.getIcon(projectCategory.id)
  );
}

export function addMetaToProject(
  project: Project,
  projectConfig: ProjectConfig | null,
  projectCategoryConfig: ProjectCategoryConfig | null
): Project {
  return project.cloneWith(
    projectConfig?.getIcon(project.id),
    project.category
      ? addMetaToProjectCategory(project.category, projectCategoryConfig)
      : undefined,
    projectConfig?.getTaskProjectIds(project.id)
  );
}

export function addMetaToEntry(
  entry: Entry,
  projectById: { [projectId: number]: Project }
): Entry {
  return entry.cloneWithProject(
    entry._projectId ? projectById[entry._projectId.asNumber] : undefined
  );
}
