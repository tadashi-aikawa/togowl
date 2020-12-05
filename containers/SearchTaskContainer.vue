<template>
  <div>
    <v-text-field
      autofocus
      :value="state.word"
      label="Search all tasks by words"
      prepend-icon="mdi-magnify"
      color="cyan"
      item-color="cyan"
      @input="changeWord"
    ></v-text-field>

    <template v-for="[date, tasks] in dateAndTasks">
      <v-lazy :key="date">
        <div>
          <v-subheader class="center" style="color: lightcyan">
            <v-icon dense style="margin-right: 3px; color: lightcyan">
              mdi-calendar
            </v-icon>
            {{ date }}
          </v-subheader>
          <v-divider></v-divider>
        </div>
      </v-lazy>
      <v-lazy v-for="task in tasks" :key="task.id.unwrap()" min-height="30">
        <TaskSwiperEntry
          :task="task"
          :disabled-start="disabledStart"
          hidden-drag-handler
          @on-click-start-button="handleClickStartButton"
        />
      </v-lazy>
    </template>

    <v-overlay key="loading" absolute :value="isTaskLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script lang="ts">
import _ from "lodash";
import { defineComponent, reactive, computed } from "@vue/composition-api";
import { taskStore, timerStore } from "~/store";
import TaskSwiperEntry from "~/components/TaskSwiperEntry.vue";
import { Task } from "~/domain/task/entity/Task";

export default defineComponent({
  components: { TaskSwiperEntry },
  setup(_props, { emit }) {
    const state = reactive({
      word: "",
    });

    const filterBy = (task: Task) => {
      if (state.word.length < 2) {
        return false;
      }

      const words = state.word.toLowerCase().split(" ");
      const titleWords = words.filter((x) => !x.startsWith("#"));
      const projectWords = words
        .filter((x) => x.startsWith("#"))
        .map((x) => x.slice(1));

      return (
        titleWords.every((x) => task.title.toLocaleLowerCase().includes(x)) &&
        projectWords.every((x) =>
          task.project?.name.unwrap().toLocaleLowerCase().includes(x)
        )
      );
    };

    const dateAndTasks = computed(() =>
      _(taskStore.tasks)
        .filter(filterBy)
        .groupBy((x) => x.dueDate?.displayDateFull ?? "None")
        .map((tasks, date) => [date, tasks])
        .orderBy(([date, _tasks]) => date)
        .value()
    );

    const isTaskLoading = computed(() => taskStore.status === "in_progress");
    const disabledStart = computed(() => !!timerStore.currentEntry);

    const changeWord = _.debounce((word) => {
      state.word = word;
    }, 300);

    return {
      state,
      dateAndTasks,
      isTaskLoading,
      disabledStart,
      changeWord,
      // TODO: Action in TaskSwiperEntry
      handleClickStartButton(task: Task) {
        emit("on-click-start", task);
      },
    };
  },
});
</script>

<style lang="scss" scoped></style>
