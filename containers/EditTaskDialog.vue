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
          <span style="margin-left: 5px">Edit Task</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="state.isValid">
            <v-row style="padding: 0 10px 0">
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
            Update
          </v-btn>
        </v-card-actions>
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
import { defineComponent, reactive, watch } from "@vue/composition-api";
import { taskStore } from "~/utils/store-accessor";
import TaskProjectSelector from "~/components/TaskProjectSelector.vue";
import TaskLabelSelector from "~/components/TaskLabelSelector.vue";
import { TaskProject } from "~/domain/task/entity/TaskProject";
import { Label } from "~/domain/task/entity/Label";
import { Task } from "~/domain/task/entity/Task";

export default defineComponent({
  components: { TaskProjectSelector, TaskLabelSelector },
  props: {
    task: { type: Object as () => Task, required: true },
    visible: { type: Boolean },
  },
  setup(props) {
    const TASK_NAME_RULES = [(v: string) => !!v || "Task name is required"];

    const state = reactive({
      isValid: false,
      taskName: "",
      project: undefined as TaskProject | undefined,
      labels: [] as Label[],
      processing: false,
      snackbar: false,
      snackbarMessage: "",
      processErrorMessage: "",
      visible: props.visible as boolean,
    });

    watch(
      () => state.visible,
      (_visible) => {
        if (_visible) {
          state.taskName = props.task.title;
          state.project = props.task.project;
          state.labels = props.task.labels;
        }
      },
      { immediate: true }
    );

    const handleClickUpdate = async () => {
      state.processing = true;
      state.processErrorMessage = "";
      const err = await taskStore.updateTask({
        taskId: props.task.id,
        title: state.taskName,
        project: (state.project as TaskProject | null) ?? null,
        labels: state.labels,
      });
      state.processing = false;

      if (err) {
        state.processErrorMessage = `Failure to Update task: ${state.taskName}`;
        console.error(err.message);
        return;
      }

      state.snackbar = true;
      state.snackbarMessage = `Update 『${state.taskName}』`;
      state.visible = false;
    };

    const handleCtrlEnter = () => {
      if (state.isValid) {
        handleClickUpdate();
      }
    };

    return {
      TASK_NAME_RULES,
      state,
      handleCtrlEnter,
    };
  },
});
</script>

<style lang="scss" scoped></style>
