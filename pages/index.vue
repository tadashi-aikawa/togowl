<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-img v-if="currentEntry" src="https://pbs.twimg.com/media/CRpxsErUsAQWJOv.png" />
      <v-img v-else src="https://pbs.twimg.com/media/ChSq8rwU4AAel50.jpg" />

      <TimerEntryComponent
        v-if="currentEntry"
        :current-entry="currentEntry"
        :disabled="!isRealtimeEnabled"
        :loading="fetchingStatus === 'in_progress'"
        :complete-button-loading="waitForCompleteEntry"
        @on-click-complete="complete"
      />
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
}

export default Root;
</script>
