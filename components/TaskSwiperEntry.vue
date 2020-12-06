<template>
  <div>
    <swiper ref="mySwiper" :options="state.swiperOption">
      <swiper-slide
        :class="{ 'swiper-close-area': true, compact, divider: isDivider }"
      >
        <v-row align="center" justify="center" style="height: 100%">
          <v-icon color="white" :small="compact || isDivider"
            >mdi-checkbox-marked-circle-outline</v-icon
          >
          <span :class="{ complete: true, compact, divider: isDivider }"
            >Complete</span
          >
        </v-row>
      </swiper-slide>
      <swiper-slide
        :class="{ 'swiper-main-area': true, compact, divider: isDivider }"
      >
        <TaskEntry
          :task="task"
          :disabled="disabledStart"
          :compact="compact"
          :hidden-start="hiddenStart || isDivider"
          :hidden-drag-handler="hiddenDragHandler"
          :divider="isDivider"
          @on-click-start-button="handleClickStartButton"
          @on-click-complete-button="completeTask"
        />
      </swiper-slide>
      <swiper-slide
        :class="{ 'swiper-extra-menu-area': true, compact, divider: isDivider }"
      >
        <v-list-item>
          <v-container
            :class="{
              'swiper-extra-menu-list-item': true,
              compact,
              divider: isDivider,
            }"
          >
            <v-row align="center" justify="center">
              <task-swiper-button
                :compact="compact || isDivider"
                icon="mdi-chevron-triple-up"
                @click="updateToTodayAtFirst"
              />
              <task-swiper-button
                :compact="compact || isDivider"
                icon="mdi-chevron-triple-down"
                @click="updateToTodayAtLast"
              />
              <task-swiper-button
                :compact="compact || isDivider"
                icon="mdi-calendar-arrow-right"
                @click="updateToTomorrow"
              />
              <calendar-selector :date="date" @select-date="updateDueDate">
                <task-swiper-button
                  :compact="compact || isDivider"
                  icon="mdi-calendar-edit"
                />
              </calendar-selector>
            </v-row>
          </v-container>
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
import TaskSwiperButton from "~/components/TaskSwiperButton.vue";
import { taskStore } from "~/utils/store-accessor";
import { DateTime } from "~/domain/common/DateTime";
import "swiper/swiper-bundle.css";

export default defineComponent({
  components: {
    TaskEntry,
    Swiper,
    SwiperSlide,
    CalendarSelector,
    TaskSwiperButton,
  },
  props: {
    task: { type: Object as () => Task, required: true },
    disabledStart: { type: Boolean },
    hiddenStart: { type: Boolean },
    hiddenDragHandler: { type: Boolean },
    compact: { type: Boolean },
  },
  setup(props, { emit }) {
    const state = reactive({
      swiperOption: {
        initialSlide: 1,
        loop: false,
        threshold: 10,
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

    // or undefined?
    const date = computed(() => props.task.dueDate?.displayDate);

    const isDivider = computed(() =>
      props.task.titleWithoutDecorated.startsWith("⏲")
    );

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
      date,
      mySwiper,
      isDivider,
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

  &.divider {
    height: 45px;
  }
  &.compact {
    height: 35px;
  }
}

.swiper-main-area {
  &.divider {
    height: 45px;
  }
  &.compact {
    height: 35px;
  }
}

.swiper-extra-menu-area {
  height: auto;
  opacity: 0.8;
  background-color: dimgrey;

  &.divider {
    height: 45px;
  }
  &.compact {
    height: 35px;
  }
}

.swiper-extra-menu-list-item {
  &.divider {
    padding-top: 5px;
  }
  &.compact {
    padding-top: 0;
  }
}

.complete {
  padding-left: 5px;
  &.compact {
    font-size: 75%;
  }
}
</style>
