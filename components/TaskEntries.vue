<template>
  <div>
    <draggable
      class="list-group"
      handle=".drag-and-drop-handler"
      ghost-class="ghost"
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
          min-height="80"
        >
          <TaskEntry :task="task" @on-click-start="handleClickPlayButton" />
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
import TaskEntry from '~/components/TaskEntry.vue';

@Component({
  components: { TaskEntry, draggable },
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

  handleClickPlayButton(task: Task) {
    this.$emit('on-click-start', task);
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
  opacity: 0.5;
  background: darkslategray;
}
.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-leave-active {
  position: absolute;
}
</style>
