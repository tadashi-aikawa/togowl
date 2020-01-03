<template>
  <v-flex xs12 sm8 md6>
    <v-container fluid>
      <v-form ref="form" v-model="valid">
        <v-row>
          <v-col cols="2">
            <v-img src="https://cdn.svgporn.com/logos/slack-icon.svg" max-width="30" />
          </v-col>
          <v-col cols="10">
            <v-text-field
              v-model="incomingWebHookUrl"
              :rules="incomingWebHookUrlRules"
              label="Incoming web hook URL"
              placeholder="https://hooks.slack.com/services/AAA/BBB/c123"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            <v-img src="https://cdn.svgporn.com/logos/slack-icon.svg" max-width="30" />
          </v-col>
          <v-col cols="10">
            <v-text-field
              v-model="notifyChannel"
              :rules="notifyChannelRules"
              label="Channel to notify"
              placeholder="#times_mimizou"
            />
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-btn :disabled="!valid" color="success" class="mr-4" @click="save">
            Save
          </v-btn>
        </v-row>
      </v-form>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { notificationStore } from '~/utils/store-accessor';
import { ChannelName } from '~/domain/notification/vo/ChannelName';
import { Url } from '~/domain/common/Url';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';

@Component({})
class Root extends Vue {
  valid = false;

  incomingWebHookUrl = '';
  incomingWebHookUrlRules = [
    (v: string) => !!v || 'Incoming web hook URL is required',
    (v: string) => Url.isValid(v) || 'Invalid URL',
  ];

  notifyChannel = '';
  notifyChannelRules = [(v: string) => ChannelName.isValid(v) || 'Channel name must start with "#"'];

  mounted() {
    this.incomingWebHookUrl = notificationStore.slackConfig?.incomingWebHookUrl?.value ?? '';
    this.notifyChannel = notificationStore.slackConfig?.notifyTo?.value ?? '';
  }

  save() {
    console.log('save..');
    notificationStore.updateSlackConfig(SlackConfig.create(this.incomingWebHookUrl, this.notifyChannel));
  }
}

export default Root;
</script>
