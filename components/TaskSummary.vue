<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="task" :style="{ width: width }" v-html="title" />
    <ProjectSummary v-if="task.entryProject" :project="task.entryProject" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "~/node_modules/nuxt-property-decorator";
import ProjectSummary from "~/components/ProjectSummary.vue";
import { Task } from "~/domain/task/entity/Task";
import { toEmojiString } from "~/utils/string";

@Component({ components: { ProjectSummary } })
class TaskSummary extends Vue {
  @Prop()
  task: Task;

  @Prop()
  width: string;

  get title(): string {
    return toEmojiString(this.task.title);
  }
}
export default TaskSummary;
</script>

<style scoped>
.task {
  font-size: 95% !important;
  color: white;
  padding-bottom: 3px;
  white-space: initial;
}
>>> .joypixels {
  width: 18px;
}
</style>
