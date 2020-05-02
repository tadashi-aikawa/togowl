<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-row>
        <v-img
          src="https://github.com/tadashi-aikawa/togowl/raw/master/public/icon.png"
          width="64"
        />
      </v-row>
      <v-row align="center" justify="center">
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="mailAddress"
            :rules="mailAddressRules"
            label="Mail address"
            required
          />
          <v-text-field
            v-model="password"
            type="password"
            :rules="passwordRules"
            label="Password"
            required
          />
        </v-form>
      </v-row>
      <v-row align="center" justify="center">
        <template v-if="isChecking">
          <v-progress-circular indeterminate color="green" />
          <span>Login...</span>
        </template>
        <template v-else>
          <v-btn :disabled="!valid" color="success" class="mr-4" @click="login">
            Login
          </v-btn>
        </template>
      </v-row>
      <v-row align="center" justify="center">
        <div style="padding: 15px;">
          <v-alert v-if="error" type="error">
            {{ error.message }}
          </v-alert>
        </div>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { MailAddress } from "~/domain/authentication/vo/MailAddress";
import { LoginPayload } from "~/domain/authentication/vo/LoginPayload";
import { TogowlError } from "~/domain/common/TogowlError";
import { authenticationStore } from "~/utils/store-accessor";

@Component({})
class Login extends Vue {
  valid = false;

  mailAddress = "";
  mailAddressRules = [
    (v: string) => !!v || "Mail address is required",
    (v: string) => MailAddress.isValid(v) || "Mail address must be valid",
  ];

  password = "";
  passwordRules = [(v: string) => !!v || "Password is required"];

  login() {
    authenticationStore.login(
      LoginPayload.create(MailAddress.create(this.mailAddress), this.password)
    );
  }

  get error(): TogowlError | null {
    return authenticationStore.error;
  }

  get isChecking(): boolean {
    return authenticationStore.status === "check";
  }
}

export default Login;
</script>
