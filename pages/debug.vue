<template>
  <v-flex xs12 sm8 md6>
    <span>Last click time: {{ lastClickTime }}</span>
    <v-container fluid>
      <v-btn @click="refreshLog">Show logs</v-btn>
      <v-btn @click="clear">Clear logs</v-btn>
      <v-textarea dark :value="logString" rows="20" />
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import logger from '~/utils/global-logger';
import { DateTime } from '~/domain/common/DateTime';

@Component({})
class Debug extends Vue {
  logString = '';
  lastClickTime = '';

  refreshLog(): void {
    this.lastClickTime = DateTime.now().displayTime;
    this.logString = logger.logs
      .slice()
      .reverse()
      .join('\n');
  }

  clear(): void {
    logger.clear();
    this.refreshLog();
  }
}
export default Debug;
</script>
