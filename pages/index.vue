<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-fade-transition hide-on-leave>
        <div v-if="currentEntry">
          <CurrentTimeEntry :current-entry="currentEntry" :disabled="!isTimeEntryTrusted" :loading="isLoading" />
          <v-row align="center" justify="center" style="margin-bottom: 20px;">
            <v-btn class="mx-2" fab small dark color="grey" :disabled="!canAction" @click="pause">
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
                :menu-props="{ maxHeight: 220 }"
                item-text="hashAsTask"
                placeholder="Search entries past"
                full-width
                clearable
                return-object
              >
                <template v-slot:selection="data">
                  <div style="padding: 5px;">
                    <EntrySummary :entry="data.item" width="70vw" />
                  </div>
                </template>
                <template v-slot:item="data">
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
          <TimeEntry :entry="currentCalendarEntry" @on-click-start="start" />
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

  async notify(message: string) {
    const err = await notificationStore.notifyToSlack(message);

    this.snackbar = true;
    if (err) {
      this.snackMessage = err.message;
      this.snackbarColor = 'error';
    } else {
      this.snackMessage = `Notify to ${notificationStore.slackConfig?.notifyTo?.value}`;
      this.snackbarColor = null;
    }
  }

  async start(entry: Entry) {
    this.waitForBlockedAction = true;

    pipe(
      await timerStore.startEntry(entry),
      fold(
        _err => {},
        startedEntry => {
          // FIXME: Move NotificationService as domain service
          const project = `:card_index_dividers: \`${startedEntry.project?.nameWithoutBracket ?? 'No Project'}\``;
          const projectCategory = startedEntry.projectCategory
            ? `:busts_in_silhouette: \`${startedEntry.projectCategory.nameWithoutBracket}\` > `
            : '';
          this.notify(`:tio2: \`開始\`  *${startedEntry!.description}*    ${projectCategory}${project}`);
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
        stoppedEntry => {
          // FIXME: Move NotificationService as domain service
          const project = `:card_index_dividers: \`${stoppedEntry!.project?.nameWithoutBracket ?? 'No Project'}\``;
          const projectCategory = stoppedEntry!.projectCategory
            ? `:busts_in_silhouette: \`${stoppedEntry!.projectCategory.nameWithoutBracket}\` > `
            : '';
          this.notify(
            `:renne: \`完了\` \`⏱${stoppedEntry!.duration.asJapanese}\` *${
              stoppedEntry!.description
            }*    ${projectCategory}${project}`,
          );
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
        stoppedEntry => {
          // FIXME: Move NotificationService as domain service
          const project = `:card_index_dividers: \`${stoppedEntry!.project?.nameWithoutBracket ?? 'No Project'}\``;
          const projectCategory = stoppedEntry!.projectCategory
            ? `:busts_in_silhouette: \`${stoppedEntry!.projectCategory.nameWithoutBracket}\` > `
            : '';
          this.notify(
            `:zzz_kirby: \`中断\` \`⏱${stoppedEntry!.duration.asJapanese}\` *${
              stoppedEntry!.description
            }*    ${projectCategory}${project}`,
          );
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
    return timerStore.entriesStatus;
  }

  get entriesError(): TogowlError | null {
    return timerStore.entriesError;
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
