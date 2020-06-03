<template>
  <div class="root">
    <template v-if="projectCategory">
      <v-avatar tile size="14px">
        <ProjectCategoryIcon :project-category="projectCategory" />
      </v-avatar>
      <span v-if="!iconOnly" v-text="projectCategoryName" />
      <span style="margin: 0 2px;">></span>
    </template>
    <v-avatar tile size="14px">
      <ProjectIcon :project="project" />
    </v-avatar>
    <span v-if="!iconOnly" v-text="projectName" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import ProjectIcon from "~/components/ProjectIcon.vue";
import ProjectCategoryIcon from "~/components/ProjectCategoryIcon.vue";
import { Project } from "~/domain/timer/entity/Project";
import { ProjectCategory } from "~/domain/timer/entity/ProjectCategory";

export default defineComponent({
  components: {
    ProjectIcon,
    ProjectCategoryIcon,
  },
  props: {
    project: { type: Object as () => Project, required: true },
    iconOnly: { type: Boolean },
  },
  setup(props) {
    return {
      projectCategory: computed(
        (): ProjectCategory | undefined => props.project.category
      ),
      projectName: computed(
        (): string => props.project.nameWithoutBracket ?? ""
      ),
      projectCategoryName: computed(
        (): string => props.project.category?.nameWithoutBracket ?? ""
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
