<template>
  <div>
    <div class="entry-title" :style="{ width: width }" v-text="title" />
    <div class="entry-subtitle">
      <v-avatar size="14px">
        <img src="https://a.slack-edge.com/production-standard-emoji-assets/10.2/google-medium/1f465.png" />
      </v-avatar>
      <span v-text="projectCategory" />
      <span style="margin: 0 2px;">></span>
      <v-avatar size="14px">
        <img src="https://a.slack-edge.com/production-standard-emoji-assets/10.2/google-medium/1f5c2-fe0f.png" />
      </v-avatar>
      <span v-text="project" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Entry } from '~/domain/timer/entity/Entry';

@Component({})
class EntrySummary extends Vue {
  @Prop()
  entry: Entry;

  @Prop()
  width: string;

  get title(): string {
    return this.entry.description;
  }

  get project(): string {
    return this.entry.project?.nameWithoutBracket ?? '';
  }

  get projectCategory(): string {
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
