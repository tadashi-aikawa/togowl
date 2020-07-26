<template>
  <v-list-item
    :key="task.id.unwrap()"
    :class="[itemClass, { compact: compact }]"
    :dense="compact"
    :two-line="!compact"
  >
    <v-icon
      class="drag-and-drop-handler no-swiping-class"
      style="cursor: move; color: grey;"
      >mdi-drag-vertical</v-icon
    >
    <v-list-item-content>
      <v-list-item-title style="cursor: pointer;">
        <v-menu offset-y transition="slide-y-transition" dark rounded="b-xl">
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on">
              <TaskSummary
                :task="task"
                style="padding-bottom: 5px;"
                :compact="compact"
              />
            </div>
          </template>
          <v-list dense outlined>
            <v-list-item @click="handleClickEditTaskMenuItem">
              <v-list-item-icon>
                <v-icon>mdi-monitor-edit</v-icon>
              </v-list-item-icon>
              <v-list-item-title
                >連携先サービスでタスクの編集
              </v-list-item-title>
            </v-list-item>
            <v-list-item disabled>
              <v-list-item-icon>
                <v-icon disabled>mdi-circle-edit-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title>タスクの編集</v-list-item-title>
            </v-list-item>
            <v-list-item disabled>
              <v-list-item-icon>
                <v-icon disabled>mdi-delete-forever</v-icon>
              </v-list-item-icon>
              <v-list-item-title>タスクの削除</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action v-if="!compact" style="margin-left: 5px;">
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
import { computed, defineComponent } from "@vue/composition-api";
import TaskSummary from "~/components/TaskSummary.vue";
import { Task } from "~/domain/task/entity/Task";

export default defineComponent({
  components: { TaskSummary },
  props: {
    task: { type: Object as () => Task, required: true },
    disabled: { type: Boolean },
    compact: { type: Boolean },
  },
  setup(props, { emit }) {
    const itemClass = computed((): string =>
      props.task.titleWithoutDecorated.startsWith("⏲") ? "divider" : "task"
    );

    const handleClickStartButton = () => {
      emit("on-click-start-button", props.task);
    };
    const handleClickEditTaskMenuItem = () => {
      window.open(props.task.editableUrl.unwrap(), "_blank");
    };

    return {
      itemClass,
      handleClickEditTaskMenuItem,
      handleClickStartButton,
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

.divider {
  padding: 0 5px 0 0;

  &.compact {
    padding: 0 35px 0 0;
    background-color: #303030;
    text-align: center;
  }
}
</style>
