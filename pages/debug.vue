<template>
  <v-flex xs12 sm8 md6>
    <v-container fluid>
      <v-btn @click="click">Show logs</v-btn>
      <v-textarea dark :value="logString" rows="20" />
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import logger from '~/utils/global-logger';

@Component({})
class Debug extends Vue {
  logString = '';

  click() {
    this.logString = logger.logs.join('\n');
  }
}
export default Debug;
</script>
