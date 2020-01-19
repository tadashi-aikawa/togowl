<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-img :src="imageUrl" max-width="400" height="200">
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
          </v-row>
        </template>
      </v-img>

      <CurrentTimeEntry :current-entry="currentEntry" :disabled="!isTimeEntryTrusted" :loading="isLoading" />
      <v-row align="center" justify="center">
        <v-btn class="mx-2" fab dark color="grey" :disabled="!canAction" @click="pause">
          <v-icon dark large>mdi-pause</v-icon>
        </v-btn>
        <v-btn class="mx-2" fab dark color="teal" :disabled="!canAction" @click="complete">
          <v-icon dark large>mdi-check-bold</v-icon>
        </v-btn>
      </v-row>
      <v-row v-if="fetchingError" align="center" justify="center">
        <div style="padding: 15px;">
          <v-alert type="error">
            {{ fetchingError.message }}
          </v-alert>
        </div>
      </v-row>
    </v-flex>

    <v-tabs v-model="tabs" fixed-tabs style="margin-top: 20px;">
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
        <TimeEntry :entries="entries" @on-click-start="start" />
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
          <TimeEntry :entries="[currentCalendarEntry]" @on-click-start="start" />
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

@Component({
  components: { CurrentTimeEntry, TimeEntry, EntryCalendar },
})
class Root extends Vue {
  snackbar = false;
  snackbarColor: string | null = null;
  snackMessage = '';
  waitForBlockedAction = false;
  tabs = null;

  calendarBottomSheet = false;
  currentCalendarEntry: Entry | null = null;

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

  get fetchingStatus(): ActionStatus {
    return timerStore.fetchingStatus;
  }

  get fetchingError(): TogowlError | null {
    return timerStore.fetchingError;
  }

  get currentEntry(): Entry | null {
    return timerStore.currentEntry;
  }

  get entries(): Entry[] | null {
    return timerStore.entriesWithinDay;
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

  get imageUrl(): string {
    return this.currentEntry
      ? 'https://pbs.twimg.com/media/CRpxsErUsAQWJOv.png'
      : 'https://pbs.twimg.com/media/ChSq8rwU4AAel50.jpg';
  }

  get isLoading(): boolean {
    return this.fetchingStatus === 'in_progress' || timerStore.entriesStatus === 'in_progress';
  }
}

export default Root;
</script>
