<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-fade-transition hide-on-leave>
        <div v-if="currentEntry">
          <CurrentTimeEntry :current-entry="currentEntry" :disabled="!isTimeEntryTrusted" :loading="isLoading" />
          <v-row align="center" justify="center" style="margin-bottom: 20px;">
            <v-btn class="mx-2" fab small dark color="purple darken-1" :disabled="!canAction" @click="cancel">
              <v-icon dark>mdi-delete</v-icon>
            </v-btn>
            <v-btn class="mx-2" fab small dark color="grey darken-1" :disabled="!canAction" @click="pause">
              <v-icon dark>mdi-pause</v-icon>
            </v-btn>
            <v-btn class="mx-2" fab small dark color="teal" :disabled="!canAction" @click="complete">
              <v-icon dark>mdi-check-bold</v-icon>
            </v-btn>
            <v-btn class="mx-2" fab small dark color="brown darken-1" :disabled="!canAction" @click="connectPrevious">
              <v-icon dark>mdi-transit-connection-variant</v-icon>
            </v-btn>
          </v-row>
        </div>
      </v-fade-transition>
      <v-fade-transition hide-on-leave>
        <div v-if="!currentEntry">
          <v-row align="center" justify="center">
            <v-col cols="9">
              <v-autocomplete
                v-model="selectedEntry"
                :items="candidatedEntries"
                :filter="customFilter"
                :menu-props="{ maxHeight: 220 }"
                item-text="hashAsTask"
                placeholder="Search entries past"
                full-width
                clearable
                return-object
              >
                <template #selection="data">
                  <div style="padding: 5px;">
                    <EntrySummary :entry="data.item" width="70vw" />
                  </div>
                </template>
                <template #item="data">
                  <div style="padding: 5px;">
                    <EntrySummary :entry="data.item" />
                  </div>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="2">
              <v-btn class="mx-2" fab small dark color="green" :disabled="!selectedEntry" @click="start(selectedEntry)">
                <v-icon dark large>mdi-play</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-fade-transition>

      <v-row v-if="fetchingError" align="center" justify="center">
        <v-fade-transition>
          <div style="padding: 15px;">
            <v-alert type="error">
              {{ fetchingError.message }}
            </v-alert>
          </div>
        </v-fade-transition>
      </v-row>
    </v-flex>

    <v-tabs v-model="tabs" fixed-tabs>
      <v-tabs-slider></v-tabs-slider>

      <v-tab href="#tabs-1" class="primary--text">
        <v-icon>mdi-history</v-icon>
      </v-tab>

      <v-tab href="#tabs-2" class="primary--text">
        <v-icon>mdi-calendar</v-icon>
      </v-tab>

      <v-tab disabled href="#tabs-3" class="primary--text">
        <v-icon>mdi-lock-question</v-icon>
      </v-tab>

      <v-tab-item value="tabs-1">
        <v-sheet :class="currentEntry ? 'tab-content-tracking-on' : 'tab-content-tracking-off'">
          <TimeEntries :entries="entries" :loading="isEntriesLoading" @on-click-start="start" />
        </v-sheet>
        <v-row v-if="entriesError" align="center" justify="center">
          <div style="padding: 15px;">
            <v-alert type="error">
              {{ entriesError.message }}
            </v-alert>
          </div>
        </v-row>
      </v-tab-item>
      <v-tab-item value="tabs-2">
        <EntryCalendar :entries="entries" @on-click-event="handleClickCalendarEntry" />

        <v-bottom-sheet v-if="currentCalendarEntry" v-model="calendarBottomSheet">
          <v-list>
            <TimeEntry :entry="currentCalendarEntry" @on-click-start="start" />
          </v-list>
        </v-bottom-sheet>
      </v-tab-item>
      <v-tab-item value="tabs-3">???</v-tab-item>
    </v-tabs>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" top>
      {{ snackMessage }}
      <v-btn color="blue" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>

    <v-overlay :value="waitForBlockedAction">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { notificationStore, timerStore } from '~/utils/store-accessor';
import { Entry } from '~/domain/timer/entity/Entry';
import { TogowlError } from '~/domain/common/TogowlError';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';
import { ActionStatus } from '~/domain/common/ActionStatus';
import CurrentTimeEntry from '~/components/CurrentTimeEntry.vue';
import TimeEntry from '~/components/TimeEntry.vue';
import EntryCalendar from '~/components/EntryCalendar.vue';
import EntrySummary from '~/components/EntrySummary.vue';
import TimeEntries from '~/components/TimeEntries.vue';

@Component({
  components: { CurrentTimeEntry, TimeEntry, TimeEntries, EntryCalendar, EntrySummary },
})
class Root extends Vue {
  snackbar = false;
  snackbarColor: string | null = null;
  snackMessage = '';
  waitForBlockedAction = false;
  tabs = null;

  calendarBottomSheet = false;
  currentCalendarEntry: Entry | null = null;

  selectedEntry: Entry | null = null;

  handleClickCalendarEntry(entry: Entry) {
    this.currentCalendarEntry = entry;
    this.calendarBottomSheet = true;
  }

  showSnackBar(message: string, error: boolean) {
    this.snackMessage = message;
    this.snackbarColor = error ? 'error' : null;
    this.snackbar = true;
  }

  async start(entry: Entry) {
    this.waitForBlockedAction = true;

    pipe(
      await timerStore.startEntry(entry),
      fold(
        _err => {},
        async _entry => {
          const err = await notificationStore.notifyStartEvent(entry);
          if (err) {
            this.showSnackBar(err.message, true);
          }
        },
      ),
    );

    this.waitForBlockedAction = false;
  }

  async complete() {
    this.waitForBlockedAction = true;
    pipe(
      await timerStore.completeCurrentEntry(),
      fold(
        _err => {},
        async entry => {
          this.selectedEntry = null;
          const err = await notificationStore.notifyDoneEvent(entry);
          if (err) {
            this.showSnackBar(err.message, true);
          }
        },
      ),
    );
    this.waitForBlockedAction = false;
  }

  async pause() {
    this.waitForBlockedAction = true;
    pipe(
      await timerStore.completeCurrentEntry(),
      fold(
        _err => {},
        async entry => {
          this.selectedEntry = null;
          const err = await notificationStore.notifyPauseEvent(entry);
          if (err) {
            this.showSnackBar(err.message, true);
          }
        },
      ),
    );
    this.waitForBlockedAction = false;
  }

  async connectPrevious() {
    this.waitForBlockedAction = true;
    await timerStore.connectPreviousEntry();
    this.waitForBlockedAction = false;
  }

  async cancel() {
    this.waitForBlockedAction = true;
    pipe(
      await timerStore.cancelCurrentEntry(),
      fold(
        _err => {},
        async _entry => {
          this.selectedEntry = null;
          const err = await notificationStore.notifyCancelEvent();
          if (err) {
            this.showSnackBar(err.message, true);
          }
        },
      ),
    );
    this.waitForBlockedAction = false;
  }

  get fetchingStatus(): ActionStatus {
    return timerStore.fetchingStatus;
  }

  get fetchingError(): TogowlError | null {
    return timerStore.fetchingError;
  }

  get currentEntry(): Entry | null {
    return timerStore.currentEntry;
  }

  get entries(): Entry[] {
    return timerStore.entriesWithinDay;
  }

  get candidatedEntries(): Entry[] {
    return timerStore.candidatedEntries;
  }

  get entriesStatus(): ActionStatus {
    return timerStore.entryByIdStatus;
  }

  get entriesError(): TogowlError | null {
    return timerStore.entryByIdError;
  }

  get isRealtimeEnabled(): boolean {
    return timerStore.realtime;
  }

  get isTimeEntryTrusted(): boolean {
    return this.isRealtimeEnabled && this.fetchingStatus === 'success';
  }

  get canAction(): boolean {
    return this.isTimeEntryTrusted && !!this.currentEntry;
  }

  get isLoading(): boolean {
    return this.fetchingStatus === 'in_progress';
  }

  get isEntriesLoading(): boolean {
    return this.entriesStatus === 'in_progress' && this.entries.length === 0;
  }

  customFilter(item: Entry, queryText: string): boolean {
    const description = item.description.toLowerCase();
    const projectName = item.project?.name.value.toLowerCase();
    const projectCategoryName = item.projectCategory?.name.value.toLowerCase();

    return queryText
      .toLowerCase()
      .split(' ')
      .every(q => description.includes(q) || projectName?.includes(q) || projectCategoryName?.includes(q));
  }
}

export default Root;
</script>

<style scoped>
.tab-content-tracking-on {
  height: calc(100vh - 325px);
  overflow-y: scroll;
}
.tab-content-tracking-off {
  height: calc(100vh - 245px);
  overflow-y: scroll;
}
</style>
