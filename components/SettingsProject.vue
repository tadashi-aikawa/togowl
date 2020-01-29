<template>
  <div>
    <v-treeview :items="projectCategories" item-key="key" open-on-click>
      <template v-slot:prepend="{ item, open }">
        <v-avatar size="14px" style="margin-right: 5px;">
          <img v-if="item.node.icon" :src="item.node.icon.url" />
          <v-icon v-else small color="grey">mdi-help-circle-outline</v-icon>
        </v-avatar>
        <span v-text="item.node.name.value" />
        <v-btn icon style="margin-left: 5px;" @click="e => onClickEditButton(e, item)">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-treeview>
    <v-bottom-sheet v-if="currentItem" v-model="bottomSheet">
      <SettingsProjectEdit :name="currentItem.node.name.value" :icon="currentItem.node.icon" @on-save="saveItem" />
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue } from '~/node_modules/nuxt-property-decorator';
import { timerStore } from '~/utils/store-accessor';
import { Project } from '~/domain/timer/entity/Project';
import { ProjectCategory } from '~/domain/timer/entity/ProjectCategory';
import SettingsProjectEdit from '~/components/SettingsProjectEdit.vue';
import { Icon } from '~/domain/common/Icon';

interface ProjectItem {
  key: string;
  type: 'project';
  node: Project;
}

interface ProjectCategoryItem {
  key: string;
  type: 'project_category';
  node: ProjectCategory;
  children: ProjectItem[];
}

@Component({ components: { SettingsProjectEdit } })
class SettingsProject extends Vue {
  bottomSheet = false;
  currentItem: ProjectItem | ProjectCategoryItem | null = null;

  async mounted() {
    await timerStore.fetchProjects();
  }

  get projectCategories(): ProjectCategoryItem[] {
    return _(timerStore.projectsGroupByCategory)
      .values()
      .map(
        pjs =>
          ({
            key: pjs[0].category!.id.value,
            type: 'project_category',
            node: pjs[0].category!,
            children: pjs.map(p => ({ key: p.id.value, type: 'project', node: p })),
          } as ProjectCategoryItem),
      )
      .value();
  }

  onClickEditButton(event: Event, item: ProjectItem | ProjectCategoryItem) {
    event.stopPropagation();
    this.currentItem = item;
    this.bottomSheet = true;
  }

  saveItem(icon: Icon) {
    switch (this.currentItem?.type) {
      case 'project':
        timerStore.updateProject(this.currentItem.node.cloneWith(icon, this.currentItem.node.category));
        break;
      case 'project_category':
        timerStore.updateProjectCategory(this.currentItem.node.cloneWith(icon));
        break;
    }
    this.currentItem = null;
    this.bottomSheet = false;
  }
}
export default SettingsProject;
</script>

<style scoped></style>
