<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="state.drawer"
      :clipped="state.clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in ITEMS"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="state.logoutConfirmDialog = true">
          <v-list-item-action>
            <v-icon>mdi-exit-to-app</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div
          style="
            font-size: 90%;
            color: darkgrey;
            padding: 15px;
            text-align: center;
          "
        >
          v{{ appVersion }}
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="state.clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="state.drawer = !state.drawer" />
      <v-toolbar-title>Togowl</v-toolbar-title>
      <v-spacer />
      <add-task-dialog>
        <v-btn icon accesskey="a">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </add-task-dialog>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-dialog v-model="state.logoutConfirmDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Confirm</v-card-title>
        <v-card-text> Are you sure you want to log out?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="logout">
            Logout
          </v-btn>

          <v-btn
            color="green darken-1"
            text
            @click="state.logoutConfirmDialog = false"
          >
            Keep login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <portal-target name="global-notification" />
  </v-app>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
} from "@vue/composition-api";
import AddTaskDialog from "~/containers/AddTaskDialog.vue";
import { getAppVersion } from "~/utils/package";
import { authenticationStore, taskStore } from "~/store";

export default defineComponent({
  components: {
    AddTaskDialog,
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

    const appVersion = computed(() => getAppVersion());

    const logout = () => {
      authenticationStore.logout();
      state.logoutConfirmDialog = false;
    };

    onMounted(async () => {
      await taskStore.fetchProjects();
    });

    return {
      ITEMS,
      state,
      appVersion,
      logout,
    };
  },
});
</script>
