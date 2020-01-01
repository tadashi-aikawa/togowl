<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-row align="center" justify="center">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field v-model="mailAddress" :rules="mailAddressRules" label="Mail address" required />

          <v-text-field v-model="password" type="password" :rules="passwordRules" label="Password" required />

          <template v-if="isLoading"> <v-progress-circular indeterminate color="green" /> Login... </template>
          <template v-else>
            <v-btn :disabled="!valid" color="success" class="mr-4" @click="login">
              Login
            </v-btn>
          </template>
        </v-form>

        <v-img src="https://github.com/tadashi-aikawa/togowl/raw/master/public/icon.png" width="64" />
      </v-row>
      <v-row align="center" justify="center">
        <div style="padding: 15px;">
          <v-alert v-if="verifiedUser.isNotEmpty()" type="success">
            <p>Welcome to {{ verifiedUser.name.value }}!!</p>
          </v-alert>
          <v-alert v-if="errorMessage" type="error">
            {{ errorMessage }}
          </v-alert>
        </div>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { authenticationStore } from '~/store/';
import { LoginPayload, MailAddress, User } from '~/domain/authentication/vo';

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
    authenticationStore.login(LoginPayload.create(MailAddress.create(this.mailAddress), this.password));
  }

  get errorMessage(): string | undefined {
    return authenticationStore.error.message;
  }

  get verifiedUser(): User {
    return authenticationStore.verifiedUser;
  }

  get isLoading(): boolean {
    return authenticationStore.isLoading;
  }
}

export default Root;
</script>
