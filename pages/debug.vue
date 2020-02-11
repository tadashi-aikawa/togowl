<template>
  <v-flex xs12 sm8 md6>
    <span>Last click time: {{ lastClickTime }}</span>
    <v-container fluid>
      <v-btn @click="refreshLog">Show logs</v-btn>
      <v-btn @click="clear">Clear logs</v-btn>
      <div style="padding: 15px 0; overflow-x: scroll;">
        <template v-for="(log, i) in logs">
          <span :key="i" :class="getClass(log)" v-text="log" />
        </template>
      </div>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import logger from '~/utils/global-logger';
import { DateTime } from '~/domain/common/DateTime';

@Component({})
class Debug extends Vue {
  logs: string[] = [];
  lastClickTime = '';

  refreshLog(): void {
    this.lastClickTime = DateTime.now().displayTime;
    this.logs = logger.logs.slice().reverse();
  }

  clear(): void {
    logger.clear();
    this.refreshLog();
  }

  getClass(log: string) {
    return {
      log: true,
      'log-on': log.includes('.on') && !log.includes('Before'),
      disabled: log.includes('Before'),
      'log-success': log.includes('success'),
      'log-error': log.includes('error'),
    };
  }
}
export default Debug;
</script>
<style scoped>
.log {
  font-size: 12px;
  display: block;
}
.disabled {
  color: grey;
}
.log-success {
  color: lawngreen;
}
.log-errore {
  color: orangered;
  font-weight: bolder;
}
.log-on {
  color: cornflowerblue;
}
</style>
