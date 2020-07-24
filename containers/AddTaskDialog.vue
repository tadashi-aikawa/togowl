<template>
  <div>
    <v-dialog
      v-model="state.visible"
      max-width="600px"
      dark
      overlay-opacity="0.85"
    >
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
                color="cyan"
                item-color="cyan"
                clearable
              />
            </v-row>
            <v-row style="margin-top: 10px; padding: 0 10px 0 20px;">
              <task-project-selector
                v-model="state.project"
              ></task-project-selector>
            </v-row>
            <v-row style="margin-top: 10px; padding: 0 10px 0 20px;">
              <task-label-selector v-model="state.labels"></task-label-selector>
            </v-row>
          </v-form>
          <v-alert v-if="state.processErrorMessage" dense outlined type="error">
            {{ state.processErrorMessage }}
          </v-alert>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="center">
          <v-btn
            :disabled="!state.isValid"
            color="green darken-2"
            @click="handleClickTodayFirst"
          >
            <v-icon>mdi-calendar-today</v-icon>
            <v-icon>mdi-chevron-triple-up</v-icon>
          </v-btn>
          <v-btn
            :disabled="!state.isValid"
            color="green darken-2"
            @click="handleClickTodayLast"
          >
            <v-icon>mdi-calendar-today</v-icon>
            <v-icon>mdi-chevron-triple-down</v-icon>
          </v-btn>
          <v-btn
            :disabled="!state.isValid"
            color="green darken-2"
            @click="handleClickTomorrow"
          >
            <v-icon>mdi-calendar-arrow-right</v-icon>
          </v-btn>
          <v-btn
            :disabled="!state.isValid"
            color="green darken-2"
            @click="handleClickLater"
          >
            <v-icon>mdi-calendar-blank</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-overlay key="state.processing" absolute :value="state.processing">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-dialog>
    <v-snackbar
      v-model="state.snackbar"
      :timeout="3000"
      color="success darken-2"
      dark
      top
    >
      {{ state.snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";
import { taskStore } from "~/utils/store-accessor";
import { DateTime } from "~/domain/common/DateTime";
import TaskProjectSelector from "~/components/TaskProjectSelector.vue";
import TaskLabelSelector from "~/components/TaskLabelSelector.vue";
import { TaskProject } from "~/domain/task/entity/TaskProject";
import { Label } from "~/domain/task/entity/Label";

export default defineComponent({
  components: { TaskProjectSelector, TaskLabelSelector },
  props: {
    visible: { type: Boolean },
  },
  setup(props) {
    const TASK_NAME_RULES = [(v: string) => !!v || "Task name is required"];

    const state = reactive({
      isValid: false,
      taskName: "",
      project: undefined,
      labels: [] as Label[],
      processing: false,
      snackbar: false,
      snackbarMessage: "",
      processErrorMessage: "",
      visible: props.visible as boolean,
    });

    const emitAddTaskAction = async (payload: {
      successMessage: string;
      dueDate?: DateTime;
      dayOrder?: number;
    }) => {
      state.processing = true;
      state.processErrorMessage = "";
      const err = await taskStore.addTask({
        title: state.taskName,
        dueDate: payload.dueDate,
        dayOrder: payload.dayOrder,
        project: state.project as TaskProject | undefined,
        labels: state.labels,
      });
      state.processing = false;

      if (err) {
        state.processErrorMessage = `Failure to create task: ${state.taskName}`;
        console.error(err.message);
        return;
      }

      state.snackbar = true;
      state.snackbarMessage = payload.successMessage;
      state.visible = false;
    };

    const handleClickTodayFirst = async () => {
      await emitAddTaskAction({
        dueDate: DateTime.now(),
        successMessage: `🆕 Add 『${state.taskName}』 at FIRST today.`,
      });
    };

    const handleClickTodayLast = async () => {
      await emitAddTaskAction({
        dueDate: DateTime.now(),
        successMessage: `🆕 Add 『${state.taskName}』 at LAST today.`,
        dayOrder: 999,
      });
    };

    const handleClickTomorrow = async () => {
      await emitAddTaskAction({
        dueDate: DateTime.tomorrow(),
        successMessage: `🆕 Add 『${state.taskName}』 at tomorrow.`,
      });
    };

    const handleClickLater = async () => {
      await emitAddTaskAction({
        successMessage: `🆕 Add 『${state.taskName}』.`,
      });
    };

    return {
      TASK_NAME_RULES,
      state,
      handleClickTodayFirst,
      handleClickTodayLast,
      handleClickTomorrow,
      handleClickLater,
    };
  },
});
</script>

<style lang="scss" scoped></style>
