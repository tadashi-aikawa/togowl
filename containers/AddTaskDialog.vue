<template>
  <v-dialog v-model="state.visible" max-width="600px" dark>
    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <slot></slot>
      </div>
    </template>
    <v-card>
      <v-card-title>
        <v-icon>mdi-format-list-checks</v-icon>
        <span style="margin-left: 5px;">Add Task</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="state.isValid">
          <v-row style="padding: 0 10px 0;">
            <v-text-field
              v-model="state.taskName"
              autofocus
              :rules="TASK_NAME_RULES"
              placeholder="Morning coffee☕"
              hint="Task name"
              persistent-hint
            />
          </v-row>
          <v-row style="margin-top: 10px; padding: 0 10px 0 20px;">
            <task-project-selector
              v-model="state.project"
            ></task-project-selector>
          </v-row>
        </v-form>
        <v-alert v-if="state.processErrorMessage" dense outlined type="error">
          {{ state.processErrorMessage }}
        </v-alert>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="center">
        <v-btn text :disabled="!state.isValid" @click="handleClickToday"
          >Today</v-btn
        >
        <v-btn text :disabled="!state.isValid" @click="handleClickTomorrow"
          >Tomorrow</v-btn
        >
        <v-btn text :disabled="!state.isValid" @click="handleClickLater"
          >Later</v-btn
        >
      </v-card-actions>
    </v-card>
    <v-overlay key="state.processing" absolute :value="state.processing">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-snackbar
      v-model="state.snackbar"
      :timeout="3000"
      color="success darken-2"
      dark
    >
      {{ state.snackbarMessage }}
    </v-snackbar>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";
import { taskStore } from "~/utils/store-accessor";
import { DateTime } from "~/domain/common/DateTime";
import TaskProjectSelector from "~/components/TaskProjectSelector.vue";
import { TaskProject } from "~/domain/task/entity/TaskProject";

export default defineComponent({
  components: { TaskProjectSelector },
  props: {
    visible: { type: Boolean },
  },
  setup(props) {
    const TASK_NAME_RULES = [(v: string) => !!v || "Task name is required"];

    const state = reactive({
      isValid: false,
      taskName: "",
      project: undefined,
      processing: false,
      snackbar: false,
      snackbarMessage: "",
      processErrorMessage: "",
      visible: props.visible as boolean,
    });

    const emitAddTaskAction = async (dueDate?: DateTime) => {
      state.processing = true;
      state.processErrorMessage = "";
      const err = await taskStore.addTask({
        title: state.taskName,
        dueDate,
        project: state.project as TaskProject | undefined,
      });
      state.processing = false;

      if (err) {
        state.processErrorMessage = `Failure to create task: ${state.taskName}`;
        console.error(err.message);
        return;
      }

      state.snackbar = true;
      state.snackbarMessage = `"${state.taskName}" is created!`;
    };

    const handleClickToday = async () => {
      await emitAddTaskAction(DateTime.now());
    };

    const handleClickTomorrow = async () => {
      await emitAddTaskAction(DateTime.tomorrow());
    };

    const handleClickLater = async () => {
      await emitAddTaskAction();
    };

    return {
      TASK_NAME_RULES,
      state,
      handleClickToday,
      handleClickTomorrow,
      handleClickLater,
    };
  },
});
</script>

<style lang="scss" scoped></style>
