<template>
  <v-layout column justify-center align-center>
    <div class="calendar-area">
      <EntryCalendar :entries="entries" :height="calendarHeight" />
    </div>
    <v-overlay key="loading" absolute :value="loadingEntries">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-layout>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import EntryCalendar from "~/components/EntryCalendar.vue";
import { timerStore } from "~/utils/store-accessor";

export default defineComponent({
  components: {
    EntryCalendar,
  },
  setup() {
    const calendarHeight = computed(() => "calc(100vh - 80px)");
    const entries = computed(() => timerStore.entries);
    const loadingEntries = computed(
      () => timerStore.entryByIdStatus === "in_progress"
    );

    return {
      calendarHeight,
      entries,
      loadingEntries,
    };
  },
});
</script>

<style lang="scss" scoped>
.calendar-area {
  padding: 5px;
  width: 100%;
}
</style>
