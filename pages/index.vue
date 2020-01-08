<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-img v-if="currentEntry" src="https://pbs.twimg.com/media/CRpxsErUsAQWJOv.png" max-width="400" height="200">
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
          </v-row>
        </template>
      </v-img>
      <v-img v-else src="https://pbs.twimg.com/media/ChSq8rwU4AAel50.jpg" max-width="400" height="200">
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
          </v-row>
        </template>
      </v-img>

      <TimerEntryComponent
        :current-entry="currentEntry"
        :disabled="!isTimeEntryTrusted"
        :loading="fetchingStatus === 'in_progress'"
      />
      <v-row align="center" justify="center">
        <v-btn color="info" :loading="waitForCompleteEntry" :disabled="!canComplete" @click="complete">
          Complete
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
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" top vertical>
      {{ snackMessage }}
      <v-btn color="blue" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { notificationStore, timerStore } from '~/utils/store-accessor';
import { Entry } from '~/domain/timer/vo/Entry';
import { TogowlError } from '~/domain/common/TogowlError';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';
import { ActionStatus } from '~/domain/common/ActionStatus';
import TimerEntryComponent from '~/components/TimerEntryComponent.vue';

@Component({
  components: { TimerEntryComponent },
})
class Root extends Vue {
  snackbar = false;
  snackbarColor: string | null = null;
  snackMessage = '';
  waitForCompleteEntry = false;

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

  async complete() {
    this.waitForCompleteEntry = true;
    pipe(
      await timerStore.completeCurrentEntry(),
      fold(
        _err => {},
        async stoppedEntry => {
          await this.notify(
            `:renne: \`完了\` \`⏱${stoppedEntry!.duration.asJapanese}\` *${stoppedEntry!.description}*`,
          );
        },
      ),
    );
    this.waitForCompleteEntry = false;
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

  get isRealtimeEnabled(): boolean {
    return timerStore.realtime;
  }

  get isTimeEntryTrusted(): boolean {
    return this.isRealtimeEnabled && this.fetchingStatus === 'success';
  }

  get canComplete(): boolean {
    return this.isTimeEntryTrusted && !!this.currentEntry;
  }
}

export default Root;
</script>
