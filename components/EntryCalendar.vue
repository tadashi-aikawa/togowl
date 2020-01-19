<template>
  <div>
    <v-sheet height="600">
      <v-calendar
        ref="calendar"
        type="day"
        event-color="rgba(0, 255, 0, 0.5)"
        :events="events"
        dark
        hide-header
        :event-overlap-threshold="30"
        interval-minutes="30"
        interval-height="96"
        interval-count="48"
      >
        <template v-slot:event="{ event }">
          <div style="height: 100%; padding: 2px;" @click="handleClickEntry(event.entry)">
            {{ event.name }}
          </div>
        </template>
      </v-calendar>
    </v-sheet>

    <v-btn fixed dark small bottom right outlined fab @click="handleClickMoveToNow">
      <v-icon>mdi-send-clock</v-icon>
    </v-btn>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Entry } from '~/domain/timer/entity/Entry';
import { DateTime } from '~/domain/common/DateTime';

@Component({})
class EntryCalendar extends Vue {
  @Prop()
  entries: Entry[];

  mounted() {
    const calendarRef: any = this.$refs.calendar;
    calendarRef.scrollToTime(DateTime.now().minusMinutes(60).displayTimeWithoutSeconds);
  }

  get events(): any[] {
    return this.entries
      ? this.entries.map(x => ({
          name: x.description,
          start: x.start.displayDateTimeWithoutSeconds,
          end: x.stop?.displayDateTimeWithoutSeconds,
          entry: x,
        }))
      : [];
  }

  handleClickEntry(entry: Entry) {
    this.$emit('on-click-event', entry);
  }

  handleClickMoveToNow() {
    const calendarRef: any = this.$refs.calendar;
    calendarRef.scrollToTime(DateTime.now().minusMinutes(60).displayTimeWithoutSeconds);
  }
}
export default EntryCalendar;
</script>

<style scoped></style>
