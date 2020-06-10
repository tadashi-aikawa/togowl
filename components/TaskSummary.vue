<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div :class="styleClass" :style="{ width: width }" v-html="titleHtml" />
    <ProjectSummary
      v-if="task.entryProject"
      :project="task.entryProject"
      :icon-only="compact"
      style="display: inline; white-space: initial;"
    />
    <v-chip
      v-for="label of labels"
      :key="label"
      class="ma-1"
      x-small
      dark
      style="white-space: initial;"
    >
      {{ label }}
    </v-chip>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import ProjectSummary from "~/components/ProjectSummary.vue";
import { Task } from "~/domain/task/entity/Task";

export default defineComponent({
  components: { ProjectSummary },
  props: {
    task: { type: Object as () => Task, required: true },
    width: { type: String },
    compact: { type: Boolean },
  },
  setup(props) {
    const titleHtml = computed(() => props.task.titleAsMarkdown);
    const styleClass = computed(() => [
      props.compact ? "task-compact" : "task",
      "markdown",
    ]);
    const labels = computed(() => props.task.labels.map((x) => x.name));

    return {
      titleHtml,
      styleClass,
      labels,
    };
  },
});
</script>

<style scoped>
.task {
  font-size: 95% !important;
  color: white;
  padding-bottom: 3px;
  white-space: initial;
}

.task-compact {
  color: white;
  padding-bottom: 3px;
  white-space: initial;
  display: inline;
}
</style>
