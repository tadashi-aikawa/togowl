<template>
  <div>
    <v-sheet :height="height">
      <v-calendar
        ref="calendarRef"
        type="day"
        dark
        :start="start"
        :events="events"
        event-color="rgba(0, 255, 0, 0.5)"
        :event-overlap-threshold="10"
        interval-minutes="60"
        :interval-height="state.intervalHeight"
        interval-count="24"
        interval-width="35"
        :interval-format="(d) => d.time"
      >
        <template #event="{ event }">
          <div style="height: 100%; padding: 2px;">
            <v-avatar v-if="event.entry.project" tile size="14px">
              <ProjectIcon
                :project="event.entry.project"
                :project-category-as-default="true"
              />
            </v-avatar>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span class="markdown" v-html="event.nameAsHtml" />
          </div>
        </template>
      </v-calendar>

      <v-btn
        v-if="state.zoomUp"
        fixed
        dark
        small
        bottom
        right
        fab
        style="margin: 0 168px 48px 0;"
        @click="handleClickZoomDown"
      >
        <v-icon>mdi-magnify-minus</v-icon>
      </v-btn>
      <v-btn
        v-else
        fixed
        dark
        small
        bottom
        right
        fab
        style="margin: 0 168px 48px 0;"
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
        style="margin: 0 112px 48px 0;"
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
        style="margin: 0 56px 48px 0;"
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
        style="margin: 0 0 48px 0;"
        @click="handleClickMoveToNow"
      >
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
      zoomUp: false,
      intervalHeight: 64,
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
        state.zoomUp = true;
        state.intervalHeight = 96;
      },
      handleClickZoomDown() {
        state.zoomUp = false;
        state.intervalHeight = 64;
      },
    };
  },
});
</script>

<style scoped></style>
