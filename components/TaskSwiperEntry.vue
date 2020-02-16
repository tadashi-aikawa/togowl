<template>
  <swiper ref="mySwiper" :options="swiperOption">
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
              <v-btn outlined class="mx-2" fab small dark @click="updateToToday">
                <v-icon>mdi-calendar-today</v-icon>
              </v-btn>
            </div>
            <div align="center">
              <v-btn outlined class="mx-2" fab small dark @click="updateToTomorrow">
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
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Task } from '~/domain/task/entity/Task';
import TaskEntry from '~/components/TaskEntry.vue';
import { taskStore } from '~/utils/store-accessor';
import { DateTime } from '~/domain/common/DateTime';

@Component({
  components: { TaskEntry },
})
class TaskSwiperEntry extends Vue {
  @Prop()
  task: Task;

  @Prop({ default: false })
  disabledStart: boolean;

  swiperOption = {};

  created() {
    const self = this;
    this.swiperOption = {
      initialSlide: 1,
      loop: false,
      noSwipingClass: 'no-swiping-class',
      on: {
        transitionEnd(this: { activeIndex: number }) {
          if (this.activeIndex === 0) {
            self.completeTask();
          }
        },
      },
    };
  }

  get swiper(): any {
    return (this.$refs.mySwiper as any).swiper;
  }

  completeTask() {
    taskStore.completeTask(this.task.id);
  }

  async updateToToday() {
    await taskStore.updateDueDate({ taskId: this.task.id, dueDate: DateTime.now() });
    this.swiper.slideTo(1);
  }

  async updateToTomorrow() {
    await taskStore.updateDueDate({ taskId: this.task.id, dueDate: DateTime.tomorrow() });
    this.swiper.slideTo(1);
  }

  handleClickStartButton() {
    this.$emit('on-click-start-button', this.task);
  }
}
export default TaskSwiperEntry;
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
