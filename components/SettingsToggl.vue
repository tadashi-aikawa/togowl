<template>
  <v-form ref="form" v-model="isValid">
    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="togglApiToken"
          :rules="togglApiTokenRules"
          label="Toggl API Token"
          placeholder="Show https://toggl.com/app/profile"
          clearable
        />
      </v-col>
    </v-row>

    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="togglWorkSpaceId"
          :rules="togglWorkSpaceIdRules"
          label="Toggl Workspace ID"
          placeholder="toggl.com/app/settings (URL)"
          clearable
        />
      </v-col>
    </v-row>

    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="proxy"
          label="Proxy server host for avoiding CORS"
          placeholder="your.proxy.host"
          clearable
        />
      </v-col>
    </v-row>

    <v-row align="center" justify="center">
      <v-btn
        :disabled="!isValid"
        color="success"
        class="mr-4"
        :loading="isTimerConfigUpdating"
        @click="saveTimerConfig"
      >
        Save
      </v-btn>

      <div style="padding: 15px;">
        <v-alert v-if="timerConfigUpdateError" type="error">
          {{ timerConfigUpdateError.message }}
        </v-alert>
      </div>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Component, Vue } from "~/node_modules/nuxt-property-decorator";
import { timerStore } from "~/utils/store-accessor";
import { TogowlError } from "~/domain/common/TogowlError";
import { TimerConfig } from "~/domain/timer/vo/TimerConfig";

@Component({})
class SettingsToggl extends Vue {
  // Toggl
  isValid = false;

  togglApiToken = "";
  togglApiTokenRules = [(v: string) => !!v || "Toggl API token is required"];

  togglWorkSpaceId = "";
  togglWorkSpaceIdRules = [
    (v: string) => !!v || "Toggl workspace ID is required",
    (v: string) => /^[0-9]+$/.test(v) || "Toggl workspace ID must be numbers",
  ];

  proxy = "";

  mounted() {
    this.togglApiToken = timerStore.timerConfig?.token ?? "";
    this.togglWorkSpaceId = String(timerStore.timerConfig?.workspaceId ?? "");
    this.proxy = timerStore.timerConfig?.proxy ?? "";
  }

  get isTimerConfigUpdating(): boolean {
    return timerStore.updateStatus === "in_progress";
  }

  get timerConfigUpdateError(): TogowlError | null {
    return timerStore.updateError;
  }

  saveTimerConfig() {
    // XXX: currentTaskId?
    timerStore.updateTimerConfig(
      TimerConfig.of({
        token: this.togglApiToken,
        workspaceId: Number(this.togglWorkSpaceId),
        proxy: this.proxy,
      })
    );
  }
}
export default SettingsToggl;
</script>

<style scoped></style>
