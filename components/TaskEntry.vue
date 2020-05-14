<template>
  <v-list-item :key="task.id.unwrap()" two-line style="padding: 0 5px 0 0;">
    <v-icon
      class="drag-and-drop-handler no-swiping-class"
      style="cursor: move; color: grey;"
      >mdi-drag-vertical</v-icon
    >
    <v-list-item-content>
      <v-list-item-title>
        <TaskSummary :task="task" style="padding-bottom: 5px;" />
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action style="margin-left: 5px;">
      <v-btn
        icon
        class="no-swiping-class"
        :disabled="disabled"
        @click="handleClickStartButton()"
      >
        <v-icon large>mdi-play-circle-outline</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TaskSummary from "~/components/TaskSummary.vue";
import { Task } from "~/domain/task/entity/Task";

export default defineComponent({
  components: { TaskSummary },
  props: {
    task: { type: Object as () => Task, required: true },
    disabled: { type: Boolean },
  },
  setup(props, { emit }) {
    return {
      handleClickStartButton() {
        emit("on-click-start-button", props.task);
      },
    };
  },
});
</script>

<style scoped>
.sub-title {
  font-size: 75%;
  color: darkgrey;
}
</style>
