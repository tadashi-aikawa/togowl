<template>
  <div>
    <div
      :class="['task', 'markdown', { compact: compact }]"
      v-html="titleHtml"
    />
    <v-tooltip v-if="!hideRecurring" top>
      <template #activator="{ on, attrs }">
        <v-icon
          v-if="task.isRecurring"
          style="color: lightblue; font-size: 16px"
          v-bind="attrs"
          v-on="on"
          @click.stop
        >
          mdi-repeat
        </v-icon>
      </template>
      {{ task.recurringContent }}
    </v-tooltip>
    <ProjectSummary
      v-if="task.entryProject"
      :project="task.entryProject"
      :icon-only="compact"
      class="project"
    />

    <div :class="['label', { compact: compact }]">
      <v-chip
        v-for="label of labels"
        :key="label"
        :class="{ 'ma-1': !compact }"
        x-small
        dark
      >
        {{ label }}
      </v-chip>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import ProjectSummary from "~/components/ProjectSummary.vue";
import { Task } from "~/domain/task/entity/Task";

export default defineComponent({
  components: { ProjectSummary },
  props: {
    task: { type: Object as () => Task, required: true },
    compact: { type: Boolean },
    hideRecurring: { type: Boolean },
  },
  setup(props) {
    const titleHtml = computed(() => props.task.titleAsMarkdown);
    const labels = computed(() => props.task.labels.map((x) => x.name));

    return {
      titleHtml,
      labels,
    };
  },
});
</script>

<style lang="scss" scoped>
.task {
  font-size: 95% !important;
  color: white;
  padding-bottom: 3px;
  white-space: initial;

  &.compact {
    display: inline;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.label {
  display: inline;
  white-space: initial;

  &.compact {
    position: absolute;
    right: 5px;
    top: 7px;
    opacity: 0.8;
  }
}

.project {
  display: inline;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
