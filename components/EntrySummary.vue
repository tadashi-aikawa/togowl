<template>
  <div>
    <div class="entry-title" :style="{ width: width }" v-text="title" />
    <div class="entry-sub-title" v-text="subtitle" />
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
.entry-sub-title {
  font-size: 80%;
  color: darkgrey;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
