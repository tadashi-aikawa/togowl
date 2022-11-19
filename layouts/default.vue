<template>
  <div v-if="isChecking">
    <v-app dark>
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col cols="12">
          <v-row align-content="center" justify="center">
            <v-img src="icon.png" max-width="96" />
          </v-row>
        </v-col>
        <v-col class="subtitle-1 text-center" cols="12"> Please wait... </v-col>
        <v-col cols="6">
          <v-progress-linear
            color="deep-purple accent-4"
            indeterminate
            rounded
            height="6"
          />
        </v-col>
      </v-row>
    </v-app>
  </div>
  <div v-else-if="hasLogin">
    <app></app>
  </div>
  <div v-else>
    <v-app dark>
      <Login />
    </v-app>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
} from "vue";
import Login from "~/layouts/login.vue";
import App from "~/layouts/app.vue";
import { authenticationStore, userStore } from "~/utils/store-accessor";
import { getAppVersion } from "~/utils/package";

export default defineComponent({
  components: {
    Login,
    App,
  },
  setup() {
    const ITEMS = [
      {
        icon: "mdi-apps",
        title: "Top",
        to: "/",
      },
      {
        icon: "mdi-calendar",
        title: "Calendar",
        to: "/calendar",
      },
      {
        icon: "mdi-cog",
        title: "Settings",
        to: "/settings",
      },
      {
        icon: "mdi-spider",
        title: "Debug",
        to: "/debug",
      },
    ];

    const state = reactive({
      clipped: false,
      drawer: false,
      logoutConfirmDialog: false,
    });

    const isChecking = computed(() => authenticationStore.status === "check");
    const hasLogin = computed(() => authenticationStore.status === "login");
    const appVersion = computed(() => getAppVersion());

    onMounted(() => {
      if (!userStore.user) {
        authenticationStore.init();
      }
    });

    return {
      ITEMS,
      state,
      isChecking,
      hasLogin,
      appVersion,
    };
  },
});
</script>
