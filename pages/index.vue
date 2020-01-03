<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-row align="center" justify="center">
        <v-img src="https://lohas.nicoseiga.jp/thumb/4998905i?" />
        <div style="padding: 10px;">
          <v-btn color="error" class="mr-4" @click="notify">
            ﾀｽｹﾃ...
          </v-btn>
        </div>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { notificationStore, userStore } from '~/utils/store-accessor';

@Component({})
class Root extends Vue {
  notify() {
    notificationStore.notifyToSlack(`ﾀｽｹﾃ... from ${userStore.user?.name.value}`);
  }
}

export default Root;
</script>
