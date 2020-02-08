<template>
  <div>
    <draggable :list="_tasks" :animation="150" @sort="onMove">
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
}
export default TaskEntries;
</script>
