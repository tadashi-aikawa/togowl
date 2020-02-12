<template>
  <swiper :options="swiperOption">
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
      <v-container>
        <v-row align="center" justify="center">
          <v-btn disabled outlined class="mx-2" fab small dark>
            <v-icon>mdi-calendar-arrow-right</v-icon>
          </v-btn>
          <v-btn disabled outlined class="mx-2" fab small dark>
            <v-icon>mdi-arrow-down-bold</v-icon>
          </v-btn>
          <v-btn disabled outlined class="mx-2" fab small dark>
            <v-icon>mdi-arrow-up-bold</v-icon>
          </v-btn>
        </v-row>
      </v-container>
    </swiper-slide>
  </swiper>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Task } from '~/domain/task/entity/Task';
import TaskEntry from '~/components/TaskEntry.vue';
import { taskStore } from '~/utils/store-accessor';

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

  completeTask() {
    taskStore.completeTask(this.task.id);
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
