<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-row align="center" justify="center">
        <v-img
          src="https://github.com/tadashi-aikawa/togowl/raw/master/public/icon.png"
        ></v-img>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'

@Component({
  components: {
    Logo,
    VuetifyLogo
  }
})
class Root extends Vue {}

export default Root
</script>
