<template>
  <div>
    <div class="entry-title" :style="{ width: width }" v-text="title" />
    <div class="entry-subtitle">
      <v-avatar v-if="entry.projectCategory" size="14px">
        <ProjectCategoryIcon :project-category="entry.projectCategory" />
      </v-avatar>
      <span v-text="projectCategoryName" />
      <span style="margin: 0 2px;">></span>
      <v-avatar v-if="entry.project" size="14px">
        <ProjectIcon :project="entry.project" />
      </v-avatar>
      <span v-text="projectName" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Entry } from '~/domain/timer/entity/Entry';
import ProjectIcon from '~/components/ProjectIcon.vue';
import ProjectCategoryIcon from '~/components/ProjectCategoryIcon.vue';

@Component({ components: { ProjectIcon, ProjectCategoryIcon } })
class EntrySummary extends Vue {
  @Prop()
  entry: Entry;

  @Prop()
  width: string;

  get title(): string {
    return this.entry.description;
  }

  get projectName(): string {
    return this.entry.project?.nameWithoutBracket ?? '';
  }

  get projectCategoryName(): string {
    return this.entry.projectCategory?.nameWithoutBracket ?? '';
  }

  get subtitle(): string {
    const project = this.entry.project?.nameWithoutBracket ?? '';
    const projectCategory = this.entry.projectCategory?.nameWithoutBracket ?? '';
    return projectCategory ? `${projectCategory} > ${project}` : project;
  }
}
export default EntrySummary;
</script>

<style scoped>
.entry-title {
  font-size: 100% !important;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-bottom: 3px;
}
.entry-subtitle {
  font-size: 75%;
  color: darkgrey;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
