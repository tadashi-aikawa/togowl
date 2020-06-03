<template>
  <swiper ref="mySwiper" :options="state.swiperOption">
    <swiper-slide class="swiper-close-area">
      <v-row align="center" justify="center" style="height: 100%;">
        <v-icon color="white">mdi-checkbox-marked-circle-outline</v-icon>
        <span style="padding-left: 5px;">Complete</span>
      </v-row>
    </swiper-slide>
    <swiper-slide>
      <TaskEntry
        :task="task"
        :disabled="disabledStart"
        @on-click-start-button="handleClickStartButton"
        @on-click-complete-button="completeTask"
      />
    </swiper-slide>
    <swiper-slide class="swiper-extra-menu-area">
      <v-list-item>
        <v-container>
          <v-row align="center" justify="center">
            <div align="center">
              <v-btn
                outlined
                class="mx-2"
                fab
                small
                dark
                @click="updateToToday"
              >
                <v-icon>mdi-calendar-today</v-icon>
              </v-btn>
            </div>
            <div align="center">
              <v-btn
                outlined
                class="mx-2"
                fab
                small
                dark
                @click="updateToTomorrow"
              >
                <v-icon>mdi-calendar-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-row>
        </v-container>
      </v-list-item>
    </swiper-slide>
  </swiper>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from "@vue/composition-api";
import { Task } from "~/domain/task/entity/Task";
import TaskEntry from "~/components/TaskEntry.vue";
import { taskStore } from "~/utils/store-accessor";
import { DateTime } from "~/domain/common/DateTime";

export default defineComponent({
  components: { TaskEntry },
  props: {
    task: { type: Object as () => Task, required: true },
    disabledStart: { type: Boolean },
  },
  setup(props, { emit }) {
    const mySwiper = ref<any>();

    const revertSwiperStateAsDefault = () => {
      mySwiper.value.swiper.slideTo(1);
    };

    const completeTask = async () => {
      revertSwiperStateAsDefault();
      await taskStore.completeTask(props.task.id);
    };
    const updateToToday = async () => {
      revertSwiperStateAsDefault();
      await taskStore.updateDueDate({
        taskId: props.task.id,
        dueDate: DateTime.now(),
      });
    };
    const updateToTomorrow = async () => {
      revertSwiperStateAsDefault();
      await taskStore.updateDueDate({
        taskId: props.task.id,
        dueDate: DateTime.tomorrow(),
      });
    };

    const state = reactive({
      swiperOption: {
        initialSlide: 1,
        loop: false,
        noSwipingClass: "no-swiping-class",
        on: {
          transitionEnd(this: { activeIndex: number }) {
            if (this.activeIndex === 0) {
              completeTask();
            }
          },
        },
      },
    });

    return {
      state,
      mySwiper,
      completeTask,
      updateToToday,
      updateToTomorrow,
      handleClickStartButton() {
        emit("on-click-start-button", props.task);
      },
    };
  },
});
</script>

<style scoped>
.swiper-close-area {
  height: auto;
  opacity: 0.8;
  background-color: darkslategrey;
}
.swiper-extra-menu-area {
  height: auto;
  opacity: 0.8;
  background-color: dimgrey;
}
</style>
