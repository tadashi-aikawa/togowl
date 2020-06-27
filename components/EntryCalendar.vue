<template>
  <div>
    <v-sheet :height="height">
      <v-calendar
        ref="calendarRef"
        dark
        color="teal"
        :type="zoomOption.type"
        :start="start"
        :events="events"
        :event-color="getEventColor"
        :event-overlap-threshold="10"
        interval-minutes="60"
        :interval-height="zoomOption.intervalHeight"
        interval-count="24"
        interval-width="35"
        :interval-format="(d) => d.time"
        :now="state.currentDate.displayDateTimeWithoutSeconds"
      >
        <template #event="{ event }">
          <div style="height: 100%; padding: 2px;">
            <v-avatar v-if="event.entry.project" tile size="14px">
              <ProjectIcon
                :project="event.entry.project"
                :project-category-as-default="true"
              />
            </v-avatar>
            <span class="markdown" v-html="event.nameAsHtml" />
          </div>
        </template>
      </v-calendar>

      <v-btn
        fixed
        dark
        small
        bottom
        right
        fab
        style="margin-right: 224px;"
        :disabled="isZoomUpDisabled"
        @click="handleClickZoomUp"
      >
        <v-icon>mdi-magnify-plus</v-icon>
      </v-btn>
      <v-btn
        fixed
        dark
        small
        bottom
        right
        fab
        style="margin-right: 168px;"
        :disabled="isZoomDownDisabled"
        @click="handleClickZoomDown"
      >
        <v-icon>mdi-magnify-minus</v-icon>
      </v-btn>
      <v-btn
        fixed
        dark
        small
        bottom
        right
        fab
        style="margin-right: 112px;"
        @click="handleClickPrevious"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn
        fixed
        dark
        small
        bottom
        right
        fab
        style="margin-right: 56px;"
        @click="handleClickNext"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
      <v-btn fixed dark small bottom right fab @click="handleClickMoveToNow">
        <v-icon>mdi-send-clock</v-icon>
      </v-btn>
    </v-sheet>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
} from "@vue/composition-api";
import { Entry } from "~/domain/timer/entity/Entry";
import { DateTime } from "~/domain/common/DateTime";
import ProjectIcon from "~/components/ProjectIcon.vue";

interface ZoomOption {
  type: "month" | "week" | "4day" | "day";
  intervalHeight: number;
}

const zoomOptions: ZoomOption[] = [
  { type: "month", intervalHeight: 64 },
  { type: "week", intervalHeight: 64 },
  { type: "week", intervalHeight: 96 },
  { type: "4day", intervalHeight: 64 },
  { type: "4day", intervalHeight: 96 },
  { type: "day", intervalHeight: 64 },
  { type: "day", intervalHeight: 96 },
  { type: "day", intervalHeight: 128 },
];

export default defineComponent({
  components: { ProjectIcon },
  props: {
    entries: { type: Array as () => Entry[], required: true },
    height: { type: String, required: true },
  },
  setup(props) {
    const calendarRef = ref<any>();

    const state = reactive({
      currentDate: DateTime.now(),
      zoomLevel: 5,
    });

    const start = computed(
      () => state.currentDate.displayDateTimeWithoutSeconds
    );
    const events = computed(() =>
      props.entries
        ? props.entries.map((x) => ({
            nameAsHtml: x.descriptionAsMarkdown,
            start: x.start.displayDateTimeWithoutSeconds,
            end: x.stop?.displayDateTimeWithoutSeconds,
            entry: x,
          }))
        : []
    );
    const zoomOption = computed<ZoomOption>(() => zoomOptions[state.zoomLevel]);
    const isZoomUpDisabled = computed(
      () => state.zoomLevel >= zoomOptions.length - 1
    );
    const isZoomDownDisabled = computed(() => state.zoomLevel <= 0);

    const moveToNow = () => {
      calendarRef.value.scrollToTime(
        DateTime.now().minusMinutes(240).displayTimeWithoutSeconds
      );
    };

    onMounted(() => {
      moveToNow();
    });

    return {
      state,
      calendarRef,
      start,
      events,
      zoomOption,
      isZoomUpDisabled,
      isZoomDownDisabled,
      getEventColor({ entry }: { entry: Entry }): string {
        return entry.projectCategory?.color?.unwrap() ?? "#7C3A";
      },
      handleClickMoveToNow() {
        moveToNow();
      },
      handleClickPrevious() {
        state.currentDate = state.currentDate.minusDays(1);
      },
      handleClickNext() {
        state.currentDate = state.currentDate.plusDays(1);
      },
      handleClickZoomUp() {
        state.zoomLevel++;
      },
      handleClickZoomDown() {
        state.zoomLevel--;
      },
    };
  },
});
</script>

<style scoped></style>
