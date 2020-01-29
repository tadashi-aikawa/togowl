<template>
  <div class="root">
    <template v-if="project.category">
      <v-avatar tile size="14px">
        <ProjectCategoryIcon :project-category="project.category" />
      </v-avatar>
      <span v-text="projectCategoryName" />
      <span style="margin: 0 2px;">></span>
    </template>
    <v-avatar v-if="project" tile size="14px">
      <ProjectIcon :project="project" />
    </v-avatar>
    <span v-text="projectName" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import ProjectIcon from '~/components/ProjectIcon.vue';
import ProjectCategoryIcon from '~/components/ProjectCategoryIcon.vue';
import { Project } from '~/domain/timer/entity/Project';

@Component({ components: { ProjectIcon, ProjectCategoryIcon } })
class ProjectSummary extends Vue {
  @Prop()
  project: Project;

  @Prop()
  width: string;

  get projectName(): string {
    return this.project?.nameWithoutBracket ?? '';
  }

  get projectCategoryName(): string {
    return this.project.category?.nameWithoutBracket ?? '';
  }
}
export default ProjectSummary;
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
