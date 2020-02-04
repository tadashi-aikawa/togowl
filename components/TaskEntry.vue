<template>
  <v-list-item :key="task.id.value" two-line>
    <v-list-item-avatar style="margin-right: 5px;">
      <v-icon
        class="check-button"
        v-text="checkIcon"
        @mouseenter="checkIcon = 'mdi-check-circle-outline'"
        @mouseleave="checkIcon = 'mdi-checkbox-blank-circle-outline'"
      />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        <TaskSummary :task="task" style="padding-bottom: 5px;" />
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn icon @click="handleClickPlayButton(task)">
        <v-icon large>mdi-play-circle-outline</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import TaskSummary from '~/components/TaskSummary.vue';
import { Task } from '~/domain/task/entity/Task';

@Component({
  components: { TaskSummary },
})
class TaskEntry extends Vue {
  @Prop()
  task: Task;

  checkIcon = 'mdi-checkbox-blank-circle-outline';

  handleClickPlayButton(task: Task) {
    this.$emit('on-click-start', task);
  }
}
export default TaskEntry;
</script>

<style scoped>
.sub-title {
  font-size: 75%;
  color: darkgrey;
}
.check-button {
  cursor: pointer;
  padding: 0 15px;
}

.check-button:hover {
  color: greenyellow;
  font-weight: bolder;
}
</style>
