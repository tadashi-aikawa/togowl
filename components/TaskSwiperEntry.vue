<template>
  <div>
    <swiper ref="mySwiper" :options="state.swiperOption">
      <swiper-slide :class="{ 'swiper-close-area': true, compact }">
        <v-row align="center" justify="center" style="height: 100%;">
          <v-icon color="white" :small="compact"
            >mdi-checkbox-marked-circle-outline</v-icon
          >
          <span :class="{ complete: true, compact }">Complete</span>
        </v-row>
      </swiper-slide>
      <swiper-slide :class="{ 'swiper-main-area': true, compact }">
        <TaskEntry
          :task="task"
          :disabled="disabledStart"
          :compact="compact"
          @on-click-start-button="handleClickStartButton"
          @on-click-complete-button="completeTask"
        />
      </swiper-slide>
      <swiper-slide :class="{ 'swiper-extra-menu-area': true, compact }">
        <v-list-item>
          <template v-if="compact">
            <v-container style="padding-top: 0;">
              <v-row justify="center">
                <v-btn
                  outlined
                  fab
                  class="mx-2"
                  x-small
                  height="28"
                  @click="updateToTodayAtFirst"
                >
                  <v-icon>mdi-chevron-triple-up</v-icon>
                </v-btn>
                <v-btn
                  outlined
                  fab
                  class="mx-2"
                  x-small
                  height="28"
                  @click="updateToTodayAtLast"
                >
                  <v-icon>mdi-chevron-triple-down</v-icon>
                </v-btn>
                <v-btn
                  outlined
                  fab
                  class="mx-2"
                  x-small
                  height="28"
                  @click="updateToTomorrow"
                >
                  <v-icon>mdi-calendar-arrow-right</v-icon>
                </v-btn>
                <calendar-selector :date="date" @select-date="updateDueDate">
                  <v-btn outlined class="mx-2" fab x-small dark height="28">
                    <v-icon>mdi-calendar-edit</v-icon>
                  </v-btn>
                </calendar-selector>
                <v-btn
                  outlined
                  fab
                  class="mx-2"
                  x-small
                  height="28"
                  :href="editableUrl"
                  target="_blank"
                >
                  <v-icon>mdi-pencil-box-multiple</v-icon>
                </v-btn>
              </v-row>
            </v-container>
          </template>
          <template v-else>
            <v-container>
              <v-row align="center" justify="center">
                <v-btn
                  outlined
                  class="mx-2"
                  fab
                  small
                  dark
                  @click="updateToTodayAtFirst"
                >
                  <v-icon>mdi-chevron-triple-up</v-icon>
                </v-btn>
                <v-btn
                  outlined
                  class="mx-2"
                  fab
                  small
                  dark
                  @click="updateToTodayAtLast"
                >
                  <v-icon>mdi-chevron-triple-down</v-icon>
                </v-btn>
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
                <calendar-selector :date="date" @select-date="updateDueDate">
                  <v-btn outlined class="mx-2" fab small dark>
                    <v-icon>mdi-calendar-edit</v-icon>
                  </v-btn>
                </calendar-selector>
                <v-btn
                  outlined
                  class="mx-2"
                  fab
                  small
                  dark
                  :href="editableUrl"
                  target="_blank"
                >
                  <v-icon>mdi-pencil-box-multiple</v-icon>
                </v-btn>
              </v-row>
            </v-container>
          </template>
        </v-list-item>
      </swiper-slide>
    </swiper>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, ref } from "@vue/composition-api";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import { Task } from "~/domain/task/entity/Task";
import TaskEntry from "~/components/TaskEntry.vue";
import CalendarSelector from "~/components/CalendarSelector.vue";
import { taskStore } from "~/utils/store-accessor";
import { DateTime } from "~/domain/common/DateTime";
import "swiper/css/swiper.css";

export default defineComponent({
  components: { TaskEntry, Swiper, SwiperSlide, CalendarSelector },
  props: {
    task: { type: Object as () => Task, required: true },
    disabledStart: { type: Boolean },
    compact: { type: Boolean },
  },
  setup(props, { emit }) {
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

    const mySwiper = ref<any>();

    const revertSwiperStateAsDefault = () => {
      mySwiper.value.$swiper.slideTo(1);
    };

    const editableUrl = computed(() => props.task.editableUrl.unwrap());
    const date = computed(() => props.task.dueDate!.displayDate);

    const completeTask = async () => {
      revertSwiperStateAsDefault();
      await taskStore.completeTask(props.task.id);
    };

    const emitUpdateDueDateAction = (dueDate: DateTime, dayOrder?: number) => {
      revertSwiperStateAsDefault();
      taskStore.updateDueDate({
        taskId: props.task.id,
        dueDate: props.task.dueDate?.overwriteDate(dueDate) ?? dueDate,
        dayOrder,
      });
    };
    const updateToTodayAtFirst = () =>
      emitUpdateDueDateAction(DateTime.today(), 0);
    const updateToTodayAtLast = () =>
      emitUpdateDueDateAction(DateTime.today(), 999);
    const updateToTomorrow = () => emitUpdateDueDateAction(DateTime.tomorrow());
    const updateDueDate = (date: string) =>
      emitUpdateDueDateAction(DateTime.of(date));

    return {
      state,
      editableUrl,
      date,
      mySwiper,
      completeTask,
      updateToTodayAtFirst,
      updateToTodayAtLast,
      updateToTomorrow,
      updateDueDate,
      handleClickStartButton() {
        emit("on-click-start-button", props.task);
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.swiper-close-area {
  height: auto;
  opacity: 0.8;
  background-color: darkslategrey;

  &.compact {
    height: 35px;
  }
}

.swiper-main-area {
  &.compact {
    height: 35px;
  }
}

.swiper-extra-menu-area {
  height: auto;
  opacity: 0.8;
  background-color: dimgrey;

  &.compact {
    height: 35px;
  }
}

.complete {
  padding-left: 5px;
  &.compact {
    font-size: 75%;
  }
}
</style>
