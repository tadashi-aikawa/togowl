<template>
  <div>
    <v-sheet :height="height">
      <v-calendar
        ref="calendar"
        type="day"
        dark
        :start="start"
        :events="events"
        event-color="rgba(0, 255, 0, 0.5)"
        :event-overlap-threshold="10"
        interval-minutes="60"
        :interval-height="intervalHeight"
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
            {{ event.name }}
          </div>
        </template>
      </v-calendar>

      <v-btn
        v-if="zoomUp"
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
import { Component, Prop, Vue } from "~/node_modules/nuxt-property-decorator";
import { Entry } from "~/domain/timer/entity/Entry";
import { DateTime } from "~/domain/common/DateTime";
import ProjectIcon from "~/components/ProjectIcon.vue";

@Component({ components: { ProjectIcon } })
class EntryCalendar extends Vue {
  @Prop()
  entries: Entry[];

  @Prop()
  height: string;

  currentDate = DateTime.now();
  zoomUp = false;
  intervalHeight = 64;

  mounted() {
    this.moveToNow();
  }

  get events(): any[] {
    return this.entries
      ? this.entries.map((x) => ({
          name: x.description,
          start: x.start.displayDateTimeWithoutSeconds,
          end: x.stop?.displayDateTimeWithoutSeconds,
          entry: x,
        }))
      : [];
  }

  get start(): string {
    return this.currentDate.displayDateTimeWithoutSeconds;
  }

  moveToNow() {
    const calendarRef: any = this.$refs.calendar;
    calendarRef.scrollToTime(
      DateTime.now().minusMinutes(240).displayTimeWithoutSeconds
    );
  }

  handleClickMoveToNow() {
    this.moveToNow();
  }

  handleClickPrevious() {
    this.currentDate = this.currentDate.minusDays(1);
  }

  handleClickNext() {
    this.currentDate = this.currentDate.plusDays(1);
  }

  handleClickZoomUp() {
    this.zoomUp = true;
    this.intervalHeight = 96;
  }

  handleClickZoomDown() {
    this.zoomUp = false;
    this.intervalHeight = 64;
  }
}
export default EntryCalendar;
</script>

<style scoped></style>
