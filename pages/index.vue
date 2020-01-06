<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-img v-if="currentEntry" src="https://pbs.twimg.com/media/CRpxsErUsAQWJOv.png" />
      <v-img v-else src="https://pbs.twimg.com/media/ChSq8rwU4AAel50.jpg" />
      <template v-if="currentEntry">
        <v-row align="center" justify="center">
          <span style="padding: 15px 0 0; font-size: 110%;">
            {{ currentEntry.description }}
          </span>
        </v-row>
        <v-row align="center" justify="center">
          <span style="padding: 10px; font-size: 200%;">
            <v-icon>mdi-timer</v-icon>
            {{ currentEntryTime }}
          </span>
        </v-row>
        <v-row align="center" justify="center">
          <v-btn color="info" @click="complete" :loading="waitForCompleteEntry">
            Complete
          </v-btn>
        </v-row>
      </template>
      <template v-if="!currentEntryTime && !error">
        <v-row align="center" justify="center">
          <span style="padding: 15px 0 0; font-size: 125%;">
            I'm not doing anything :)
          </span>
        </v-row>
      </template>
      <v-row v-if="error" align="center" justify="center">
        <div style="padding: 15px;">
          <v-alert type="error">
            {{ error.message }}
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
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { notificationStore, timerStore } from '~/utils/store-accessor';
import { Entry } from '~/domain/timer/vo/Entry';
import { TogowlError } from '~/domain/common/TogowlError';
import { pipe } from '~/node_modules/fp-ts/lib/pipeable';
import { fold } from '~/node_modules/fp-ts/lib/Either';

@Component({})
class Root extends Vue {
  timerSubscriberId: number;
  currentEntryTime = '';

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

  @Watch('currentEntry')
  countUp() {
    this.currentEntryTime = this.currentEntry?.start.displayDiffFromNow() ?? '';
  }

  created() {
    this.countUp();
    this.timerSubscriberId = window.setInterval(this.countUp, 1000);
  }

  beforeDestroy(): void {
    window.clearInterval(this.timerSubscriberId);
  }

  get error(): TogowlError | null {
    return timerStore.error;
  }

  get currentEntry(): Entry | null {
    return timerStore.currentEntry;
  }
}

export default Root;
</script>
