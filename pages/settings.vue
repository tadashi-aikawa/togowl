<template>
  <v-flex xs12 sm8 md6>
    <v-container fluid>
      <v-card class="card-area">
        <v-img src="https://cdn.svgporn.com/logos/slack-icon.svg" max-width="30" />
        <v-form ref="form" v-model="slackConfigIsValid">
          <v-row align="center" justify="center">
            <v-col cols="10">
              <v-text-field
                v-model="incomingWebHookUrl"
                :rules="incomingWebHookUrlRules"
                label="Incoming web hook URL"
                placeholder="https://hooks.slack.com/services/AAA/BBB/c123"
                type="password"
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
                v-model="slackProxy"
                label="Proxy server host for avoiding CORS"
                placeholder="your.proxy.host"
                clearable
              />
            </v-col>
          </v-row>

          <v-row align="center" justify="center">
            <v-btn
              :disabled="!slackConfigIsValid"
              color="success"
              class="mr-4"
              :loading="isSlackConfigUpdating"
              @click="saveSlackConfig"
            >
              Save
            </v-btn>

            <div style="padding: 15px;">
              <v-alert v-if="slackConfigUpdateError" type="error">
                {{ slackConfigUpdateError.message }}
              </v-alert>
            </div>
          </v-row>
        </v-form>
      </v-card>

      <v-card class="card-area">
        <v-img
          src="https://3.bp.blogspot.com/-k89OB_bB7Bw/XJUihHgTzSI/AAAAAAAAJUw/dv9qU3C9HXE-ta0qiPCbGIgYw0-YZpuAACK4BGAYYCw/s1600/logo%2Btoggl%2Bicon.png"
          max-width="30"
        />
        <v-form ref="form" v-model="timerConfigIsValid">
          <v-row align="center" justify="center">
            <v-col cols="10">
              <v-text-field
                v-model="togglApiToken"
                :rules="togglApiTokenRules"
                label="Toggl API Token"
                placeholder="Show https://toggl.com/app/profile"
                type="password"
                clearable
              />
            </v-col>
          </v-row>

          <v-row align="center" justify="center">
            <v-col cols="10">
              <v-text-field
                v-model="togglProxy"
                label="Proxy server host for avoiding CORS"
                placeholder="your.proxy.host"
                clearable
              />
            </v-col>
          </v-row>

          <v-row align="center" justify="center">
            <v-btn
              :disabled="!timerConfigIsValid"
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
      </v-card>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { notificationStore, timerStore } from '~/utils/store-accessor';
import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { Url } from '~/domain/common/Url';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';
import { TogowlError } from '~/domain/common/TogowlError';
import { TimerConfig } from '~/domain/timer/vo/TimerConfig';

@Component({})
class Root extends Vue {
  // Slack
  slackConfigIsValid = false;

  incomingWebHookUrl = '';
  incomingWebHookUrlRules = [
    (v: string) => !!v || 'Incoming web hook URL is required',
    (v: string) => Url.isValid(v) || 'Invalid URL',
  ];

  notifyChannel = '';
  notifyChannelRules = [(v: string) => ChannelName.isValid(v) || 'Channel name must start with "#"'];

  slackProxy = '';

  // Toggl
  timerConfigIsValid = false;

  togglApiToken = '';
  togglApiTokenRules = [(v: string) => !!v || 'Toggl API token is required'];

  togglProxy = '';

  mounted() {
    this.incomingWebHookUrl = notificationStore.slackConfig?.incomingWebHookUrl?.value ?? '';
    this.notifyChannel = notificationStore.slackConfig?.notifyTo?.value ?? '';
    this.slackProxy = notificationStore.slackConfig?.proxy ?? '';
    this.togglApiToken = timerStore.timerConfig?.token ?? '';
    this.togglProxy = timerStore.timerConfig?.proxy ?? '';
  }

  get slackConfigUpdateError(): TogowlError | null {
    return notificationStore.updateError;
  }

  get isSlackConfigUpdating(): boolean {
    return notificationStore.updateStatus === 'updating';
  }

  saveSlackConfig() {
    notificationStore.updateSlackConfig(
      SlackConfig.create(this.incomingWebHookUrl, this.notifyChannel, this.slackProxy),
    );
  }

  get timerConfigUpdateError(): TogowlError | null {
    return timerStore.updateError;
  }

  get isTimerConfigUpdating(): boolean {
    return timerStore.updateStatus === 'updating';
  }

  saveTimerConfig() {
    timerStore.updateTimerConfig(TimerConfig.create(this.togglApiToken, this.togglProxy));
  }
}

export default Root;
</script>

<style scoped>
.card-area {
  margin: 5px 10px 20px;
  padding: 10px;
}
</style>
