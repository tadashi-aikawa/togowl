<template>
  <v-list-item
    :key="task.id.unwrap()"
    :class="[itemClass, { compact: compact, past: pastDueDate }]"
    :dense="compact"
    :two-line="!compact"
  >
    <v-icon
      v-if="!hiddenDragHandler"
      class="drag-and-drop-handler no-swiping-class"
      style="cursor: move; color: grey"
    >
      mdi-drag-vertical
    </v-icon>
    <v-list-item-content>
      <v-list-item-title style="cursor: pointer">
        <v-menu
          v-model="state.isMenuVisible"
          offset-y
          transition="slide-y-transition"
          dark
          rounded="b-xl"
        >
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on">
              <TaskSummary
                :task="task"
                style="padding-bottom: 5px"
                :compact="compact"
                :hide-recurring="divider"
              />
            </div>
          </template>
          <v-list dense outlined>
            <edit-task-dialog :task="task">
              <v-list-item @click="handleClickEditTaskMenuItem">
                <v-list-item-icon>
                  <v-icon>mdi-circle-edit-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
            </edit-task-dialog>
            <add-task-dialog :base-task="task">
              <v-list-item @click="handleClickEditTaskMenuItem">
                <v-list-item-icon>
                  <v-icon>mdi-content-duplicate</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Duplicate</v-list-item-title>
              </v-list-item>
            </add-task-dialog>
            <confirm-wrapper-dialog
              title="Confirm"
              :description="deleteConfirmMessageHtml"
              @confirm="handleDeleteTask"
            >
              <v-list-item @click="handleClickDeleteTaskMenuItem">
                <v-list-item-icon>
                  <v-icon>mdi-delete-forever</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </confirm-wrapper-dialog>
            <v-list-item @click="handleClickEditTaskOriginMenuItem">
              <v-list-item-icon>
                <v-icon>mdi-monitor-edit</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Edit on Todoist </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action
      v-if="!(compact || hiddenStart)"
      style="margin-left: 5px"
    >
      <v-btn
        icon
        class="no-swiping-class"
        :disabled="disabled"
        @click="handleClickStartButton()"
      >
        <v-icon large>mdi-play-circle-outline</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from "vue";
import EditTaskDialog from "~/containers/EditTaskDialog.vue";
import TaskSummary from "~/components/TaskSummary.vue";
import ConfirmWrapperDialog from "~/components/ConfirmWrapperDialog.vue";
import { Task } from "~/domain/task/entity/Task";
import { taskStore } from "~/utils/store-accessor";
import { DateTime } from "~/domain/common/DateTime";
import AddTaskDialog from "~/containers/AddTaskDialog.vue";

export default defineComponent({
  components: {
    TaskSummary,
    AddTaskDialog,
    EditTaskDialog,
    ConfirmWrapperDialog,
  },
  props: {
    task: { type: Object as () => Task, required: true },
    disabled: { type: Boolean },
    hiddenStart: { type: Boolean },
    hiddenDragHandler: { type: Boolean },
    compact: { type: Boolean },
    divider: { type: Boolean },
  },
  setup(props, { emit }) {
    const state = reactive({
      isMenuVisible: false,
    });

    const itemClass = computed((): string =>
      props.divider ? "divider" : "task"
    );
    const deleteConfirmMessageHtml = computed(
      () => `Are you sure you want to delete ${props.task.titleAsMarkdown}?`
    );

    const pastDueDate = computed(
      () => props.task.dueDate?.isBefore(DateTime.today(), true) ?? false
    );

    const handleClickStartButton = () => {
      emit("on-click-start-button", props.task);
    };

    const handleClickEditTaskOriginMenuItem = () => {
      state.isMenuVisible = false;
      window.open(props.task.editableUrl.unwrap(), "_blank");
    };
    const handleClickEditTaskMenuItem = () => {
      state.isMenuVisible = false;
    };
    const handleClickDeleteTaskMenuItem = () => {
      state.isMenuVisible = false;
    };
    const handleDeleteTask = () => {
      taskStore.deleteTask(props.task.id);
    };

    return {
      state,
      itemClass,
      deleteConfirmMessageHtml,
      pastDueDate,
      handleClickEditTaskOriginMenuItem,
      handleClickStartButton,
      handleClickEditTaskMenuItem,
      handleClickDeleteTaskMenuItem,
      handleDeleteTask,
    };
  },
});
</script>

<style lang="scss" scoped>
.sub-title {
  font-size: 75%;
  color: darkgrey;
}

.task {
  padding: 0 5px 0 0;
}

.past {
  animation: past-blink 0.75s infinite;
}

.divider {
  padding: 0 35px 0 0;
  text-align: center;
  background-color: #30303080;
}

@keyframes past-blink {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.2;
  }
}

@-webkit-keyframes past-blink {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.2;
  }
}
</style>
