<template>
  <div class="clock">
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.2em;
        letter-spacing: 0.1em;
      "
      v-text="state.currentDate"
    ></div>
    <div
      style="font-size: 3em; letter-spacing: 0.05em"
      v-text="state.currentTime"
    ></div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  reactive,
} from "@vue/composition-api";
import { DateTime } from "~/domain/common/DateTime";

export default defineComponent({
  setup() {
    const state = reactive({
      currentTime: DateTime.now().displayTime,
      currentDate: DateTime.now().displayDateFull,
    });

    const update = () => {
      state.currentTime = DateTime.now().displayTime;
      state.currentDate = DateTime.now().displayDateFull;
    };

    const timerSubscriberId = window.setInterval(update, 1000);
    onBeforeUnmount(() => {
      window.clearInterval(timerSubscriberId);
    });

    return {
      state,
    };
  },
});
</script>
<style lang="scss" scoped>
.clock {
  font-family: inherit;
  color: white;
  text-shadow: 0 0 20px rgba(10, 175, 230, 1), 0 0 20px rgba(10, 175, 230, 0);
  padding: 5px 0;
}
</style>
