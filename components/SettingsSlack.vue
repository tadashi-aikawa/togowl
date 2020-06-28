<template>
  <v-form ref="form" v-model="isValid">
    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="incomingWebHookUrl"
          :rules="incomingWebHookUrlRules"
          label="Incoming web hook URL"
          placeholder="https://hooks.slack.com/services/AAA/BBB/c123"
          clearable
        />
      </v-col>
    </v-row>

    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="notifyChannel"
          :rules="notifyChannelRules"
          label="Channel to notify"
          placeholder="#times_mimizou"
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
        :loading="isSlackConfigUpdating"
        @click="saveSlackConfig"
      >
        Save
        <v-icon right dark>mdi-cloud-upload</v-icon>
      </v-btn>

      <div v-if="slackConfigUpdateError" style="padding: 15px;">
        <v-alert type="error">
          {{ slackConfigUpdateError.message }}
        </v-alert>
      </div>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Component, Vue } from "~/node_modules/nuxt-property-decorator";
import { notificationStore } from "~/utils/store-accessor";
import { Url } from "~/domain/common/Url";
import { ChannelName } from "~/domain/notification/vo/ChannelName";
import { TogowlError } from "~/domain/common/TogowlError";
import { SlackConfig } from "~/domain/notification/vo/SlackConfig";

@Component({})
class SettingsSlack extends Vue {
  isValid = false;

  incomingWebHookUrl = "";
  incomingWebHookUrlRules = [
    (v: string) => !!v || "Incoming web hook URL is required",
    (v: string) => Url.try(v).isRight() || "Invalid URL",
  ];

  notifyChannel = "";
  notifyChannelRules = [
    (v: string) =>
      ChannelName.try(v).isRight() || 'Channel name must start with "#"',
  ];

  proxy = "";

  mounted() {
    this.incomingWebHookUrl =
      notificationStore.slackConfig?.incomingWebHookUrl?.unwrap() ?? "";
    this.notifyChannel =
      notificationStore.slackConfig?.notifyTo?.unwrap() ?? "";
    this.proxy = notificationStore.slackConfig?.proxy ?? "";
  }

  get slackConfigUpdateError(): TogowlError | null {
    return notificationStore.updateError;
  }

  get isSlackConfigUpdating(): boolean {
    return notificationStore.updateStatus === "in_progress";
  }

  saveSlackConfig() {
    notificationStore.updateSlackConfig(
      SlackConfig.of({
        incomingWebHookUrl: this.incomingWebHookUrl
          ? Url.try(this.incomingWebHookUrl).orThrow()
          : undefined,
        notifyTo: this.notifyChannel
          ? ChannelName.try(this.notifyChannel).orThrow()
          : undefined,
        proxy: this.proxy,
      })
    );
  }
}
export default SettingsSlack;
</script>

<style scoped></style>
