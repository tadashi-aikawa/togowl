<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="task" :style="{ width: width }" v-html="title" />
    <ProjectSummary v-if="task.entryProject" :project="task.entryProject" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import ProjectSummary from "~/components/ProjectSummary.vue";
import { Task } from "~/domain/task/entity/Task";
import { toEmojiString } from "~/utils/string";

export default defineComponent({
  components: { ProjectSummary },
  props: {
    task: { type: Object as () => Task, required: true },
    width: { type: String },
  },
  setup(props) {
    const title = computed(() => toEmojiString(props.task.title));

    return {
      title,
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
</style>
