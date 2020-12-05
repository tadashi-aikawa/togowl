<template>
  <div>
    <draggable
      class="list-group"
      handle=".drag-and-drop-handler"
      ghost-class="ghost"
      drag-class="drag"
      :list="state._tasks"
      :animation="150"
      @sort="onMove"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <transition-group
        type="transition"
        :name="!state.drag ? 'flip-list' : null"
      >
        <v-lazy
          v-for="task in state._tasks"
          :key="task.id.unwrap()"
          transition="fade-transition"
          :options="{
            threshold: 0.5,
          }"
          min-height="30"
        >
          <TaskSwiperEntry
            :task="task"
            :disabled-start="disabledStart"
            :compact="compact"
            @on-click-start-button="handleClickStartButton"
          />
        </v-lazy>
      </transition-group>
    </draggable>
    <v-overlay key="loading" absolute :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>
<script lang="ts">
// @ts-ignore
import draggable from "vuedraggable";
import {
  computed,
  defineComponent,
  reactive,
  watchEffect,
} from "@vue/composition-api";
import { Task } from "~/domain/task/entity/Task";
import TaskSwiperEntry from "~/components/TaskSwiperEntry.vue";
import { timerStore } from "~/store";

export default defineComponent({
  components: { TaskSwiperEntry, draggable },
  props: {
    tasks: { type: Array as () => Task[], required: true },
    loading: { type: Boolean },
    compact: { type: Boolean },
  },
  setup(props, { emit }) {
    const state = reactive({
      drag: false,
      _tasks: props.tasks as Task[],
    });

    const disabledStart = computed(() => !!timerStore.currentEntry);

    const updateTasks = () => {
      state._tasks = props.tasks;
    };
    watchEffect(updateTasks);

    return {
      state,
      disabledStart,
      // TODO: Action in TaskSwiperEntry
      handleClickStartButton(task: Task) {
        emit("on-click-start", task);
      },
      onMove() {
        emit("on-change-order", state._tasks);
      },
      onDragStart() {
        state.drag = true;
      },
      onDragEnd() {
        setTimeout(() => {
          state.drag = false;
        }, 500);
      },
    };
  },
});
</script>

<style scoped>
.ghost {
  opacity: 0.6;
  background-color: #333333;
}

.drag {
  opacity: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-enter .flip-list-leave-to {
  opacity: 0;
}

.flip-list-leave-active {
  position: absolute;
}
</style>
