<template>
  <div>
    <v-row align="center" justify="center">
      <div style="padding: 15px 15px 0; font-size: 110%;">
        <span :class="{ 'rainbow-loading': loading }" v-text="displayEntry" />
      </div>
    </v-row>
    <v-row align="center" justify="center" style="margin-top: 5px;">
      <div v-if="displayProjectCategory" class="sub-title">
        <v-avatar v-if="currentEntry.projectCategory" tile size="16px">
          <ProjectCategoryIcon
            :project-category="currentEntry.projectCategory"
          />
        </v-avatar>
        <span
          :class="{ 'rainbow-loading': loading }"
          v-text="displayProjectCategory"
        />
        <span style="padding: 0 8px 0;">></span>
      </div>
      <div v-if="displayProject" class="sub-title">
        <v-avatar v-if="currentEntry.project" tile size="16px">
          <ProjectIcon :project="currentEntry.project" />
        </v-avatar>
        <span :class="{ 'rainbow-loading': loading }" v-text="displayProject" />
      </div>
    </v-row>
    <v-row align="center" justify="center">
      <div v-if="!disabled" class="timer">
        <v-icon>mdi-timer</v-icon>
        <span
          :class="{ 'rainbow-loading': loading }"
          v-text="state.currentEntryTime"
        />
      </div>
      <div v-else class="timer" style="color: grey;">
        <v-icon color="grey">mdi-timer</v-icon>
        <span
          :class="{ 'rainbow-loading': loading }"
          v-text="state.currentEntryTime"
        />
      </div>
    </v-row>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  reactive,
  watchEffect,
} from "@vue/composition-api";
import { Entry } from "~/domain/timer/entity/Entry";
import ProjectIcon from "~/components/ProjectIcon.vue";
import ProjectCategoryIcon from "~/components/ProjectCategoryIcon.vue";

export default defineComponent({
  components: {
    ProjectIcon,
    ProjectCategoryIcon,
  },
  props: {
    currentEntry: {
      type: Object as () => Entry,
      required: true,
    },
    disabled: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
  },
  setup(props) {
    const state = reactive({
      currentEntryTime: "",
      timerSubscriberId: -1,
    });

    const countUp = () => {
      state.currentEntryTime = props.currentEntry.start.displayDiffFromNow();
    };
    watchEffect(countUp);
    state.timerSubscriberId = window.setInterval(countUp, 1000);
    onBeforeUnmount(() => {
      window.clearInterval(state.timerSubscriberId);
    });

    return {
      state,
      displayEntry: computed(
        () => props.currentEntry.description ?? "What are you doing?"
      ),
      displayProjectCategory: computed(
        () => props.currentEntry?.projectCategory?.nameWithoutBracket
      ),
      displayProject: computed(() => {
        if (!props.currentEntry) {
          return undefined;
        }
        if (!props.currentEntry.project) {
          return "No project";
        }
        return props.currentEntry.project.nameWithoutBracket;
      }),
    };
  },
});
</script>
<style scoped>
.timer {
  padding: 10px;
  font-size: 200%;
}
.sub-title {
  font-size: 85%;
  color: darkgrey;
}
</style>
