<template>
  <v-form ref="form" v-model="isValid">
    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="todoistApiToken"
          label="Todoist API Token"
          placeholder="Show https://todoist.com/prefs/integrations"
          clearable
        />
      </v-col>
    </v-row>

    <v-row align="center" justify="center">
      <v-btn color="success" class="mr-4" :loading="isTaskConfigUpdating" @click="saveTaskConfig">
        Save
      </v-btn>

      <div style="padding: 15px;">
        <v-alert v-if="taskConfigUpdateError" type="error">
          {{ taskConfigUpdateError.message }}
        </v-alert>
      </div>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Component, Vue } from '~/node_modules/nuxt-property-decorator';
import { taskStore } from '~/utils/store-accessor';
import { TogowlError } from '~/domain/common/TogowlError';
import { TaskConfig } from '~/domain/task/vo/TaskConfig';

@Component({})
class SettingsTodoist extends Vue {
  isValid = true;

  todoistApiToken = '';

  mounted() {
    this.todoistApiToken = taskStore.taskConfig?.token ?? '';
  }

  get isTaskConfigUpdating(): boolean {
    return taskStore.configStatus === 'in_progress';
  }

  get taskConfigUpdateError(): TogowlError | null {
    return taskStore.configError;
  }

  saveTaskConfig() {
    taskStore.updateTaskConfig(TaskConfig.create(this.todoistApiToken));
  }
}
export default SettingsTodoist;
</script>

<style scoped></style>
