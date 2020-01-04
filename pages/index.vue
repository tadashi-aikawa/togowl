<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-row align="center" justify="center">
        <v-img src="https://lohas.nicoseiga.jp/thumb/4998905i?" />
        <div style="padding: 10px;">
          <v-btn color="error" class="mr-4" @click="tasukete">
            ﾀｽｹﾃ...
          </v-btn>
          <div v-if="currentEntry">
            <div>{{ currentEntry.description }}</div>
            <div>{{ currentEntryTime }}</div>
          </div>
        </div>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { notificationStore, timerStore, userStore } from '~/utils/store-accessor';
import { Entry } from '~/domain/timer/vo/Entry';

@Component({})
class Root extends Vue {
  timerSubscriberId: number;
  currentEntryTime: string = '';

  tasukete() {
    notificationStore.notifyToSlack(
      `${userStore.user?.name.value} 『ﾀｽｹﾃ... ﾓｳ ${this.currentEntryTime} ﾓ ${this.currentEntry?.description} ﾔｯﾃﾙﾉﾖ..』`,
    );
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
