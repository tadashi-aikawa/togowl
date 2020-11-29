<template>
  <v-flex xs12 sm8 md6>
    <v-container fluid class="contents-area">
      <template v-if="state.activeTabIndex === 0">
        <v-card class="card-area">
          <div style="display: flex; justify-content: center; padding: 5px">
            <v-img
              src="https://github.com/tadashi-aikawa/togowl/raw/master/static/icon.png"
              max-width="30"
            />
          </div>
          <hr style="margin: 8px 0" />
          <SettingsApp />
        </v-card>
      </template>

      <template v-if="state.activeTabIndex === 1">
        <v-card class="card-area">
          <div style="display: flex; justify-content: center; padding: 5px">
            <v-icon>mdi-timer</v-icon>
            <v-icon style="padding: 0 5px">mdi-arrow-left-right-bold</v-icon>
            <v-img
              src="https://github.com/tadashi-aikawa/togowl/raw/master/static/icon.png"
              max-width="30"
            />
            <v-icon style="padding: 0 5px">mdi-arrow-left-right-bold</v-icon>
            <v-icon>mdi-format-list-checks</v-icon>
          </div>
          <hr style="margin: 8px 0" />
          <SettingsProject />
        </v-card>
      </template>

      <template v-if="state.activeTabIndex === 2">
        <v-card class="card-area">
          <div style="display: flex; justify-content: center; padding: 5px">
            <v-img
              src="https://github.com/tadashi-aikawa/togowl/raw/master/static/icon.png"
              max-width="30"
            />
            <v-icon style="padding: 0 5px">mdi-arrow-left-right-bold</v-icon>
            <v-img
              src="https://3.bp.blogspot.com/-k89OB_bB7Bw/XJUihHgTzSI/AAAAAAAAJUw/dv9qU3C9HXE-ta0qiPCbGIgYw0-YZpuAACK4BGAYYCw/s1600/logo%2Btoggl%2Bicon.png"
              max-width="30"
            />
          </div>
          <hr style="margin: 8px 0" />
          <SettingsToggl />
        </v-card>
      </template>

      <template v-if="state.activeTabIndex === 3">
        <v-card class="card-area">
          <div style="display: flex; justify-content: center; padding: 5px">
            <v-img
              src="https://github.com/tadashi-aikawa/togowl/raw/master/static/icon.png"
              max-width="30"
            />
            <v-icon style="padding: 0 5px">mdi-arrow-left-right-bold</v-icon>
            <v-img
              src="https://cdn.svgporn.com/logos/todoist-icon.svg"
              max-width="30"
            />
          </div>
          <hr style="margin: 8px 0" />
          <SettingsTodoist />
        </v-card>
      </template>

      <template v-if="state.activeTabIndex === 4">
        <v-card class="card-area">
          <div style="display: flex; justify-content: center; padding: 5px">
            <v-img
              src="https://github.com/tadashi-aikawa/togowl/raw/master/static/icon.png"
              max-width="30"
            />
            <v-icon style="padding: 0 5px">mdi-arrow-left-right-bold</v-icon>
            <v-img
              src="https://cdn.svgporn.com/logos/slack-icon.svg"
              max-width="30"
            />
          </div>
          <hr style="margin: 8px 0" />
          <SettingsSlack />
        </v-card>
      </template>
    </v-container>

    <v-bottom-navigation
      v-model="state.activeTabIndex"
      grow
      color="teal"
      dark
      shift
      fixed
    >
      <v-btn>
        <span>App</span>
        <v-icon>mdi-owl</v-icon>
      </v-btn>
      <v-btn>
        <span>Project</span>
        <v-icon>mdi-briefcase</v-icon>
      </v-btn>
      <v-btn>
        <span>Timer</span>
        <v-icon>mdi-timer</v-icon>
      </v-btn>
      <v-btn>
        <span>Task</span>
        <v-icon>mdi-format-list-checks</v-icon>
      </v-btn>
      <v-btn>
        <span>Notifier</span>
        <v-icon>mdi-slack</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-flex>
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";
import SettingsApp from "~/components/SettingsApp.vue";
import SettingsSlack from "~/components/SettingsSlack.vue";
import SettingsToggl from "~/components/SettingsToggl.vue";
import SettingsProject from "~/components/SettingsProject.vue";
import SettingsTodoist from "~/components/SettingsTodoist.vue";

export default defineComponent({
  components: {
    SettingsApp,
    SettingsSlack,
    SettingsToggl,
    SettingsTodoist,
    SettingsProject,
  },
  setup() {
    const state = reactive({
      activeTabIndex: 0,
    });

    return {
      state,
    };
  },
});
</script>

<style lang="scss" scoped>
.contents-area {
  max-height: calc(#{$contents-height} - 25px);
  overflow-y: scroll;
  padding-left: 3px;
  padding-right: 3px;
}
.card-area {
  padding: 10px;
}
</style>
