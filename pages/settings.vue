<template>
  <v-flex xs12 sm8 md6>
    <v-container fluid>
      <v-card class="card-area">
        <v-img src="https://cdn.svgporn.com/logos/slack-icon.svg" max-width="30" />
        <SettingsSlack />
      </v-card>

      <v-card class="card-area">
        <v-img
          src="https://3.bp.blogspot.com/-k89OB_bB7Bw/XJUihHgTzSI/AAAAAAAAJUw/dv9qU3C9HXE-ta0qiPCbGIgYw0-YZpuAACK4BGAYYCw/s1600/logo%2Btoggl%2Bicon.png"
          max-width="30"
        />
        <SettingsToggl />
      </v-card>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import SettingsSlack from '~/components/SettingsSlack.vue';
import SettingsToggl from '~/components/SettingsToggl.vue';

@Component({ components: { SettingsSlack, SettingsToggl } })
class Settings extends Vue {}

export default Settings;
</script>

<style scoped>
.card-area {
  margin: 5px 10px 20px;
  padding: 10px;
}
</style>
