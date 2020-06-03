<template>
  <v-sheet tile>
    <TaskEntryList
      :tasks="tasks"
      :loading="isTasksLoading"
      compact
      @on-change-order="onChangeOrder"
    />
  </v-sheet>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TaskEntryList from "~/components/TaskEntryList.vue";
import { Task } from "~/domain/task/entity/Task";

// TODO: Remove unnecessary pipes.
export default defineComponent({
  components: { TaskEntryList },
  props: {
    tasks: { type: Array as () => Task[], required: true },
    isTasksLoading: { type: Boolean },
  },
  setup(_props, { emit }) {
    return {
      onChangeOrder(tasks: Task[]) {
        emit("on-change-order", tasks);
      },
    };
  },
});
</script>

<style lang="scss" scoped></style>
