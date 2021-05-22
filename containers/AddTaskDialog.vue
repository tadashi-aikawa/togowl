<template>
  <div>
    <v-dialog
      v-model="state.visible"
      max-width="600px"
      dark
      overlay-opacity="0.85"
    >
      <template #activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on">
          <slot></slot>
        </div>
      </template>
      <v-card>
        <v-card-title>
          <v-icon>mdi-format-list-checks</v-icon>
          <span style="margin-left: 5px">Add Task</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="state.isValid">
            <v-row style="padding: 0 10px 0">
              <v-text-field
                ref="taskNameFieldRef"
                v-model="state.taskName"
                autofocus
                :rules="TASK_NAME_RULES"
                placeholder="Morning coffee☕"
                hint="Task name"
                persistent-hint
                color="cyan"
                item-color="cyan"
                clearable
                @keyup.ctrl.enter="handleCtrlEnter"
              />
            </v-row>
            <v-row style="margin-top: 10px; padding: 0 10px 0 20px">
              <task-project-selector
                v-model="state.project"
                @on-ctrl-enter="handleCtrlEnter"
              ></task-project-selector>
            </v-row>
            <v-row style="margin-top: 10px; padding: 0 10px 0 20px">
              <task-label-selector
                v-model="state.labels"
                @on-ctrl-enter="handleCtrlEnter"
              ></task-label-selector>
            </v-row>
          </v-form>
          <v-alert v-if="state.processErrorMessage" dense outlined type="error">
            {{ state.processErrorMessage }}
          </v-alert>
        </v-card-text>
        <v-divider style="padding-bottom: 10px"></v-divider>
        <v-card-actions class="center">
          <v-btn
            :disabled="!state.isValid"
            color="green darken-2"
            @click="handleCtrlEnter"
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
          <calendar-selector
            :disabled="!state.isValid"
            :date="state.date"
            @select-date="handleSelectSpecifiedDate"
          >
            <v-btn
              :disabled="!state.isValid"
              color="green darken-2"
              style="margin-left: 8px"
            >
              <v-icon>mdi-calendar-edit</v-icon>
            </v-btn>
          </calendar-selector>
        </v-card-actions>
        <div class="center">
          <v-switch
            v-model="state.shouldCreateAnother"
            label="Create another"
          ></v-switch>
        </div>
      </v-card>
      <v-overlay key="state.processing" absolute :value="state.processing">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-dialog>
    <portal to="global-notification">
      <v-snackbar
        v-model="state.snackbar"
        :timeout="3000"
        color="success darken-2"
        dark
        top
      >
        {{ state.snackbarMessage }}
      </v-snackbar>
    </portal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from "@vue/composition-api";
import { taskStore } from "~/utils/store-accessor";
import { DateTime } from "~/domain/common/DateTime";
import TaskProjectSelector from "~/components/TaskProjectSelector.vue";
import TaskLabelSelector from "~/components/TaskLabelSelector.vue";
import { TaskProject } from "~/domain/task/entity/TaskProject";
import { Label } from "~/domain/task/entity/Label";
import CalendarSelector from "~/components/CalendarSelector.vue";
import { Task } from "~/domain/task/entity/Task";

interface State {
  isValid: boolean;
  taskName: string;
  project: TaskProject | undefined;
  labels: Label[];
  date: string;
  processing: boolean;
  snackbar: boolean;
  snackbarMessage: string;
  processErrorMessage: string;
  visible: boolean;
  shouldCreateAnother: boolean;
}

export default defineComponent({
  components: { TaskProjectSelector, TaskLabelSelector, CalendarSelector },
  props: {
    baseTask: { type: Object as () => Task, default: undefined },
    visible: { type: Boolean, default: false },
  },
  setup(props) {
    const taskNameRules = [(v: string) => !!v || "Task name is required"];

    const taskNameFieldRef = ref<HTMLElement>();

    const state = reactive<State>({
      isValid: false,
      taskName: "",
      project: undefined,
      labels: [],
      date: DateTime.now().displayDate,
      processing: false,
      snackbar: false,
      snackbarMessage: "",
      processErrorMessage: "",
      visible: props.visible,
      shouldCreateAnother: false,
    });

    watch(
      () => state.visible,
      (_visible) => {
        if (_visible) {
          if (props.baseTask) {
            state.taskName = props.baseTask.title;
            state.project = props.baseTask.project;
            state.labels = props.baseTask.labels;
          } else {
            state.taskName = "";
            state.project = undefined;
            state.labels = [];
          }
        }
      },
      { immediate: true }
    );

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

      if (state.shouldCreateAnother) {
        state.taskName = "";
        taskNameFieldRef.value?.focus();
        return;
      }

      state.visible = false;
    };

    const handleClickTodayFirst = async () => {
      await emitAddTaskAction({
        dueDate: DateTime.now(),
        successMessage: `Add 『${state.taskName}』 at FIRST today.`,
        dayOrder: 0,
      });
    };

    const handleClickTodayLast = async () => {
      await emitAddTaskAction({
        dueDate: DateTime.now(),
        successMessage: `Add 『${state.taskName}』 at LAST today.`,
        dayOrder: 999,
      });
    };

    const handleClickTomorrow = async () => {
      await emitAddTaskAction({
        dueDate: DateTime.tomorrow(),
        successMessage: `Add 『${state.taskName}』 at tomorrow.`,
      });
    };

    const handleSelectSpecifiedDate = async (date: string) => {
      state.date = date;
      await emitAddTaskAction({
        dueDate: DateTime.of(date),
        successMessage: `Add 『${state.taskName}』at ${date}.`,
      });
    };

    const handleCtrlEnter = () => {
      if (state.isValid) {
        handleClickTodayFirst();
      }
    };

    return {
      TASK_NAME_RULES: taskNameRules,
      state,
      taskNameFieldRef,
      handleCtrlEnter,
      handleClickTodayLast,
      handleClickTomorrow,
      handleSelectSpecifiedDate,
    };
  },
});
</script>

<style lang="scss" scoped></style>
