<template>
  <div>
    <draggable
      class="list-group"
      handle=".drag-and-drop-handler"
      ghost-class="ghost"
      drag-class="drag"
      :list="_tasks"
      :animation="150"
      @sort="onMove"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <transition-group type="transition" :name="!drag ? 'flip-list' : null">
        <v-lazy
          v-for="task in tasks"
          :key="task.id.value"
          transition="fade-transition"
          :options="{
            threshold: 0.5,
          }"
          min-height="60"
        >
          <TaskSwiperEntry :task="task" @on-click-start-button="handleClickStartButton" />
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
import draggable from 'vuedraggable';
import { Component, Prop, Vue, Watch } from '~/node_modules/nuxt-property-decorator';
import { Task } from '~/domain/task/entity/Task';
import { taskStore } from '~/utils/store-accessor';
import TaskSwiperEntry from '~/components/TaskSwiperEntry.vue';

@Component({
  components: { TaskSwiperEntry, draggable },
})
class TaskEntries extends Vue {
  @Prop()
  tasks: Task[];

  @Prop({ default: false })
  loading: boolean;

  drag = false;
  _tasks: Task[] = [];

  @Watch('tasks', { immediate: true })
  updateTasks() {
    this._tasks = this.tasks;
  }

  handleClickStartButton(task: Task) {
    this.$emit('on-click-start', task);
  }

  completeTask(task: Task) {
    taskStore.completeTask(task.id);
  }

  onMove() {
    this.$emit('on-change-order', this._tasks);
  }

  onDragStart() {
    this.drag = true;
  }

  onDragEnd() {
    setTimeout(() => {
      this.drag = false;
    }, 500);
  }
}
export default TaskEntries;
</script>

<style scoped>
.ghost {
  opacity: 0;
}

.drag {
  opacity: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14),
    0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-leave-active {
  position: absolute;
}
</style>
