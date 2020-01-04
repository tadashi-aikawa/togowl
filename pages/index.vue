<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-img src="https://lohas.nicoseiga.jp/thumb/4998905i?" />
      <template v-if="currentEntry">
        <v-row align="center" justify="center">
          <span style="padding: 15px 0 0;">
            <v-icon>mdi-lead-pencil</v-icon>
            {{ currentEntry.description }}
          </span>
        </v-row>
        <v-row align="center" justify="center">
          <span style="padding: 10px; font-size: 200%;">
            <v-icon>mdi-timer</v-icon>
            {{ currentEntryTime }}
          </span>
        </v-row>
      </template>
      <v-row align="center" justify="center">
        <v-btn color="info" class="mr-4" @click="notify">
          Share my Entry :)
        </v-btn>
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
import { notificationStore, timerStore, userStore } from '~/utils/store-accessor';
import { Entry } from '~/domain/timer/vo/Entry';

@Component({})
class Root extends Vue {
  timerSubscriberId: number;
  currentEntryTime = '';

  snackbar = false;
  snackbarColor = '';
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
      this.snackbarColor = 'success';
    }
  }

  created() {
    timerStore.fetchCurrentEntry();
    const countUp = () => {
      this.currentEntryTime = this.currentEntry?.start.displayDiffFromNow() ?? '';
    };
    countUp();
    this.timerSubscriberId = window.setInterval(countUp, 1000);
  }

  beforeDestroy(): void {
    window.clearInterval(this.timerSubscriberId);
  }

  get currentEntry(): Entry | null {
    return timerStore.currentEntry;
  }
}

export default Root;
</script>
