<template>
  <div>
    <v-treeview :items="projectCategories" item-key="key" open-on-click>
      <template #prepend="{ item }">
        <v-avatar tile size="14px" style="margin-right: 5px;">
          <img v-if="hasIconUrl(item)" :src="item.node.icon.url" />
          <v-icon v-else small color="grey">mdi-help-circle-outline</v-icon>
        </v-avatar>
        <span v-text="item.node.name.unwrap()" />
        <v-btn
          style="margin-left: 5px;"
          :color="getColor(item)"
          x-small
          depressed
          fab
          @click="(e) => onClickEditButton(e, item)"
        >
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-treeview>
    <v-bottom-sheet v-if="currentItem" v-model="bottomSheet">
      <SettingsProjectEdit
        :name="currentItem.node.name.unwrap()"
        :icon="currentItem.node.icon"
        :color="currentItem.node.color"
        :task-project-ids="currentItem.node.taskProjectIds"
        :show-color="!isProject"
        :show-projects="isProject"
        @on-save="saveItem"
      />
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import _ from "lodash";
import { Component, Vue } from "~/node_modules/nuxt-property-decorator";
import { projectStore, taskStore } from "~/utils/store-accessor";
import { Project } from "~/domain/timer/entity/Project";
import { Project as TaskProject } from "~/domain/task/entity/Project";
import { ProjectCategory } from "~/domain/timer/entity/ProjectCategory";
import SettingsProjectEdit from "~/components/SettingsProjectEdit.vue";
import { Icon } from "~/domain/common/Icon";
import { Color } from "~/domain/common/Color";

interface ProjectItem {
  key: string;
  type: "project";
  node: Project;
}

interface ProjectCategoryItem {
  key: string;
  type: "project_category";
  node: ProjectCategory;
  children: ProjectItem[];
}

type Item = ProjectItem | ProjectCategoryItem;

@Component({ components: { SettingsProjectEdit } })
class SettingsProject extends Vue {
  bottomSheet = false;
  currentItem: Item | null = null;

  async mounted() {
    await projectStore.fetchProjects();
    await taskStore.fetchProjects();
  }

  get isProject(): boolean {
    return this.currentItem?.type === "project";
  }

  get projectCategories(): ProjectCategoryItem[] {
    return _(projectStore.projectsGroupByCategory)
      .values()
      .map(
        (pjs) =>
          ({
            key: pjs[0].category!.id.unwrap(),
            type: "project_category",
            node: pjs[0].category!,
            children: pjs.map((p) => ({
              key: p.id.unwrap(),
              type: "project",
              node: p,
            })),
          } as ProjectCategoryItem)
      )
      .value();
  }

  onClickEditButton(event: Event, item: ProjectItem | ProjectCategoryItem) {
    event.stopPropagation();
    this.currentItem = item;
    this.bottomSheet = true;
  }

  saveItem(icon: Icon, color: Color, taskProjects: TaskProject[]) {
    switch (this.currentItem?.type) {
      case "project":
        projectStore.updateProject(
          this.currentItem.node.cloneWith(
            icon,
            this.currentItem.node.category,
            taskProjects.map((x) => x.id)
          )
        );
        break;
      case "project_category":
        projectStore.updateProjectCategory(
          this.currentItem.node.cloneWith({ icon, color })
        );
        break;
    }
    this.currentItem = null;
    this.bottomSheet = false;
  }

  hasIconUrl(item: Item): boolean {
    return !!item.node.icon?.url;
  }

  getColor(item: Item): string {
    switch (item.type) {
      case "project_category":
        return item.node.color?.unwrap() ?? "#FFF0";
      default:
        return "#FFF0";
    }
  }
}
export default SettingsProject;
</script>

<style scoped></style>
