<template>
  <div class="root">
    <template v-if="project.category">
      <v-avatar tile size="14px">
        <ProjectCategoryIcon :project-category="project.category" />
      </v-avatar>
      <span v-text="projectCategoryName" />
      <span style="margin: 0 2px;">></span>
    </template>
    <v-avatar tile size="14px">
      <ProjectIcon :project="project" />
    </v-avatar>
    <span v-text="projectName" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import ProjectIcon from "~/components/ProjectIcon.vue";
import ProjectCategoryIcon from "~/components/ProjectCategoryIcon.vue";
import { Project } from "~/domain/timer/entity/Project";

export default defineComponent({
  components: {
    ProjectIcon,
    ProjectCategoryIcon,
  },
  props: {
    project: {
      type: Object as () => Project,
      required: true,
    },
  },
  setup({ project }) {
    return {
      projectName: computed((): string => project.nameWithoutBracket ?? ""),
      projectCategoryName: computed(
        (): string => project.category?.nameWithoutBracket ?? ""
      ),
    };
  },
});
</script>

<style scoped>
.root {
  font-size: 75%;
  color: darkgrey;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
