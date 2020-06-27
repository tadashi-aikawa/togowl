<template>
  <v-flex xs12 sm8 md6>
    <span>Last click time: {{ state.lastClickTime }}</span>
    <v-container fluid>
      <v-btn @click="refreshLog">Show logs</v-btn>
      <v-btn @click="clear">Clear logs</v-btn>
      <div style="padding: 15px 0; overflow-x: scroll;">
        <template v-for="(log, i) in state.logs">
          <span :key="i" :class="getClass(log)" v-text="log" />
        </template>
      </div>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";
import logger from "~/utils/global-logger";
import { DateTime } from "~/domain/common/DateTime";

export default defineComponent({
  setup() {
    const state = reactive({
      logs: [] as string[],
      lastClickTime: "",
    });

    const refreshLog = () => {
      state.lastClickTime = DateTime.now().displayTime;
      state.logs = logger.logs.slice().reverse();
    };
    const clear = () => {
      logger.clear();
      refreshLog();
    };
    const getClass = (log: string) => ({
      log: true,
      "log-on": log.includes(".on") && !log.includes("Before"),
      disabled: log.includes("Before"),
      "log-success": log.includes("success"),
      "log-error": log.includes("error"),
    });

    return {
      state,
      refreshLog,
      clear,
      getClass,
    };
  },
});
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
