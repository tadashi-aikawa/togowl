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
          <div style="height: 100%; padding: 2px">
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
        :style="{
          'margin-right': '294px',
          bottom: buttonOffsetBottom,
          right: buttonOffsetRight,
        }"
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
        :style="{
          'margin-right': '238px',
          bottom: buttonOffsetBottom,
          right: buttonOffsetRight,
        }"
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
        :style="{
          'margin-right': '182px',
          bottom: buttonOffsetBottom,
          right: buttonOffsetRight,
        }"
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
        :style="{
          'margin-right': '126px',
          bottom: buttonOffsetBottom,
          right: buttonOffsetRight,
        }"
        @click="handleClickNext"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
      <v-btn
        fixed
        dark
        small
        bottom
        right
        fab
        :style="{
          'margin-right': '70px',
          bottom: buttonOffsetBottom,
          right: buttonOffsetRight,
        }"
        @click="handleClickMoveToNow"
      >
        <v-icon>mdi-send-clock</v-icon>
      </v-btn>
      <v-btn
        fixed
        dark
        small
        bottom
        right
        fab
        :disabled="!canShare"
        :style="{
          'margin-right': '14px',
          bottom: buttonOffsetBottom,
          right: buttonOffsetRight,
        }"
        @click="handleShareDailyCalendar"
      >
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
    </v-sheet>
    <portal to="global-notification">
      <v-snackbar
        v-model="state.snackbar"
        :timeout="state.timeout"
        :color="state.snackbarColor"
        dark
        top
      >
        {{ state.snackbarMessage }}
        <template #action="{ attrs }">
          <v-btn icon v-bind="attrs" @click="state.snackbar = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </portal>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
} from "vue";
import html2canvas from "html2canvas";
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
  { type: "week", intervalHeight: 88 },
  { type: "week", intervalHeight: 112 },
  { type: "week", intervalHeight: 136 },
  { type: "4day", intervalHeight: 64 },
  { type: "4day", intervalHeight: 88 },
  { type: "4day", intervalHeight: 112 },
  { type: "4day", intervalHeight: 136 },
  { type: "day", intervalHeight: 64 },
  { type: "day", intervalHeight: 88 },
  { type: "day", intervalHeight: 112 },
  { type: "day", intervalHeight: 136 },
];

export default defineComponent({
  components: { ProjectIcon },
  props: {
    entries: { type: Array as () => Entry[], required: true },
    height: { type: String, required: true },
    buttonOffsetRight: { type: String, default: "15px" },
    buttonOffsetBottom: { type: String, default: "15px" },
  },
  setup(props) {
    const calendarRef = ref<any>();

    const state = reactive({
      currentDate: DateTime.now(),
      zoomLevel: 10,
      snackbar: false,
      snackbarMessage: "",
      snackbarColor: "",
      timeout: -1,
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
    const canShare = computed(() => zoomOption.value.type === "day");

    const moveToNow = () => {
      calendarRef.value.scrollToTime(
        DateTime.now().minusMinutes(240).displayTimeWithoutSeconds
      );
    };

    const showSuccess = (message: string) => {
      state.snackbarColor = "success darken-2";
      state.snackbarMessage = message;
      state.timeout = 3000;
      state.snackbar = true;
    };
    const showError = (message: string) => {
      state.snackbarColor = "error darken-2";
      state.snackbarMessage = message;
      state.timeout = -1;
      state.snackbar = true;
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
      canShare,
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
      async handleShareDailyCalendar() {
        if (!(navigator as any).canShare) {
          showError("This feature is not supported on your browser.");
          return;
        }

        const canvas = await html2canvas(
          document.querySelector<HTMLElement>(".v-calendar-daily__pane")!,
          {
            backgroundColor: "#1E1E1E",
          }
        );

        canvas.toBlob(async (blob: Blob | null) => {
          if (!blob) {
            showError("Fail to capture a daily calendar.");
            return;
          }

          const image = new File(
            [blob],
            `${state.currentDate.displayDate}.png`,
            {
              type: "image/png",
            }
          );
          try {
            await (navigator as any).share({
              files: [image],
            });
            showSuccess(`Success to capture a daily calendar.`);
          } catch (e) {
            showError(`Fail to capture a daily calendar. ${e}`);
          }
        });
      },
    };
  },
});
</script>

<style scoped></style>
