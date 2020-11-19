<template>
  <v-autocomplete
    :value="value"
    :items="projects"
    :filter="customFilter"
    :menu-props="{ maxHeight: 300 }"
    item-text="indexForSearch"
    color="cyan"
    item-color="cyan"
    full-width
    return-object
    hint="Project"
    persistent-hint
    dark
    dense
    clearable
    auto-select-first
    prepend-icon="mdi-briefcase"
    hide-selected
    @change="handleChangeProject"
    @keyup.ctrl.enter="handleCtrlEnter"
  >
    <template #selection="data">
      <div>
        <div class="project-name">{{ data.item.name.unwrap() }}</div>
        <div class="project-id">{{ data.item.id.unwrap() }}</div>
      </div>
    </template>
    <template #item="data">
      <div>
        <div class="project-name">{{ data.item.name.unwrap() }}</div>
        <div class="project-id">{{ data.item.id.unwrap() }}</div>
      </div>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import { projectStore } from "~/utils/store-accessor";
import { TaskProject } from "~/domain/task/entity/TaskProject";

export default defineComponent({
  props: {
    value: { type: Object as () => TaskProject, default: undefined },
  },
  setup(_props, context) {
    const projects = computed(() => projectStore.relatedTaskProjects);

    const customFilter = (project: TaskProject, queryText: string): boolean => {
      const projectName = project.name.unwrap().toLowerCase();
      return queryText
        .toLowerCase()
        .split(" ")
        .every((q) => projectName.includes(q));
    };

    const handleChangeProject = (project?: TaskProject) => {
      if (project) {
        projectStore.increaseProjectSelectedCount(project);
      }
      context.emit("input", project);
    };

    const handleCtrlEnter = () => {
      context.emit("on-ctrl-enter");
    };

    return {
      projects,
      customFilter,
      handleChangeProject,
      handleCtrlEnter,
    };
  },
});
</script>

<style lang="scss" scoped>
.project-name {
  font-size: 85%;
  display: block;
}
.project-id {
  font-size: 60%;
  color: grey;
  display: block;
}
</style>
