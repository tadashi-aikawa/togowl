<template>
  <div>
    <div class="entry" :style="{ width: width }" v-text="title" />
    <ProjectSummary v-if="entry.project" :project="entry.project" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Entry } from '~/domain/timer/entity/Entry';
import ProjectSummary from '~/components/ProjectSummary.vue';

@Component({ components: { ProjectSummary } })
class EntrySummary extends Vue {
  @Prop()
  entry: Entry;

  @Prop()
  width: string;

  get title(): string {
    return this.entry.description;
  }
}
export default EntrySummary;
</script>

<style scoped>
.entry {
  font-size: 100% !important;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-bottom: 3px;
}
</style>
