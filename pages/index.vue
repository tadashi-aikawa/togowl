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
          <v-btn color="info" @click="notify">
            Share my Entry
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
import { notificationStore, timerStore, userStore } from '~/utils/store-accessor';
import { Entry } from '~/domain/timer/vo/Entry';
import { TogowlError } from '~/domain/common/TogowlError';

@Component({})
class Root extends Vue {
  timerSubscriberId: number;
  currentEntryTime = '';

  snackbar = false;
  snackbarColor: string | null = null;
  snackMessage = '';

  async notify() {
    const err = await notificationStore.notifyToSlack(
      `:smile: ${userStore.user?.name.value} は \`${this.currentEntry?.description}\` に \`${this.currentEntryTime}\` 取り組んでいます`,
    );

    this.snackbar = true;
    if (err) {
      this.snackMessage = err.message;
      this.snackbarColor = 'error';
    } else {
      this.snackMessage = `Notify to ${notificationStore.slackConfig?.notifyTo?.value}`;
      this.snackbarColor = null;
    }
  }

  @Watch('currentEntry')
  countUp() {
    this.currentEntryTime = this.currentEntry?.start.displayDiffFromNow() ?? '';
  }

  created() {
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
