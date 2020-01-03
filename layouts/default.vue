<template>
  <v-app v-if="isChecking" dark>
    <v-row class="fill-height" align-content="center" justify="center">
      <v-col cols="12">
        <v-row align-content="center" justify="center">
          <v-img src="https://github.com/tadashi-aikawa/togowl/raw/master/public/icon.png" max-width="96" />
        </v-row>
      </v-col>
      <v-col class="subtitle-1 text-center" cols="12">
        Please wait...
      </v-col>
      <v-col cols="6">
        <v-progress-linear color="deep-purple accent-4" indeterminate rounded height="6" />
      </v-col>
    </v-row>
  </v-app>
  <v-app v-else-if="hasLogin" dark>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" :clipped="clipped" fixed app>
      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="logout">
            <v-icon>mdi-exit-to-app</v-icon>
          </v-btn>
        </template>
        <span>Logout</span>
      </v-tooltip>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>
              mdi-repeat
            </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2019 MAMANSOFT</span>
    </v-footer>
  </v-app>
  <v-app v-else dark>
    <Login />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from '~/node_modules/nuxt-property-decorator';
import Login from '~/layouts/login.vue';
import { User } from '~/domain/authentication/vo/User';
import { authenticationStore, userStore } from '~/utils/store-accessor';

@Component({
  components: { Login },
})
export default class extends Vue {
  title = 'Togowl';

  clipped = false;
  drawer = false;
  fixed = false;
  miniVariant = false;
  right = true;
  rightDrawer = false;

  items = [
    {
      icon: 'mdi-apps',
      title: 'Top',
      to: '/',
    },
    {
      icon: 'mdi-settings',
      title: 'Settings',
      to: '/settings',
    },
  ];

  mounted() {
    authenticationStore.init();
  }

  logout() {
    authenticationStore.logout();
  }

  get isChecking(): boolean {
    return authenticationStore.status === 'check';
  }

  get hasLogin(): boolean {
    return authenticationStore.status === 'login';
  }

  get verifiedUser(): User | null {
    return userStore.user;
  }
}
</script>
