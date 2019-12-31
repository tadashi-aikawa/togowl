<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-row align="center" justify="center">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field v-model="mailAddress" :rules="mailAddressRules" label="Mail address" required />

          <v-text-field v-model="password" type="password" :rules="passwordRules" label="Password" required />

          <v-btn :disabled="!valid" color="success" class="mr-4" @click="login">
            Login
          </v-btn>
        </v-form>

        <v-img src="https://github.com/tadashi-aikawa/togowl/raw/master/public/icon.png" width="64" />
      </v-row>
      <v-row align="center" justify="center">
        <v-alert v-if="loginMailAddress" type="success">
          {{ loginMailAddress }}
        </v-alert>
        <v-alert v-if="errorMessage" type="error">
          {{ errorMessage }}
        </v-alert>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { configStore } from '~/store/';
import { LoginPayload, MailAddress } from '~/domain/authentication/vo';

@Component({})
class Root extends Vue {
  valid = true;

  mailAddress = '';
  mailAddressRules = [
    (v: string) => !!v || 'Mail address is required',
    (v: string) => MailAddress.isValid(v) || 'Mail address must be valid',
  ];

  password = '';
  passwordRules = [(v: string) => !!v || 'Password is required'];

  login() {
    configStore.login(LoginPayload.create(MailAddress.create(this.mailAddress), this.password));
  }

  get errorMessage(): string | undefined {
    return configStore.error.message;
  }

  get loginMailAddress(): string | undefined {
    return configStore.verifiedMailAddress.isNotEmpty() ? configStore.verifiedMailAddress.value : undefined;
  }
}

export default Root;
</script>
