<template>
  <v-slide-y-transition group tag="v-list">
    <template v-for="task in tasks">
      <v-lazy
        :key="task.id.value"
        transition="fade-transition"
        :options="{
          threshold: 0.5,
        }"
        min-height="80"
      >
        <TaskEntry :task="task" @on-click-start="handleClickPlayButton" />
      </v-lazy>
    </template>
    <v-overlay key="loading" absolute :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-slide-y-transition>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Task } from '~/domain/task/entity/Task';
import TaskEntry from '~/components/TaskEntry.vue';

@Component({
  components: { TaskEntry },
})
class TaskEntries extends Vue {
  @Prop()
  tasks: Task[];

  @Prop({ default: false })
  loading: boolean;

  handleClickPlayButton(task: Task) {
    this.$emit('on-click-start', task);
  }
}
export default TaskEntries;
</script>
