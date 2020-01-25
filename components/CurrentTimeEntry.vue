<template>
  <div>
    <v-row align="center" justify="center">
      <div style="padding: 15px 15px 0; font-size: 110%;">
        <span :class="{ 'rainbow-loading': loading }" v-text="displayEntry" />
      </div>
    </v-row>
    <v-row align="center" justify="center" style="margin-top: 5px;">
      <div v-if="displayProjectCategory" class="sub-title">
        <v-avatar v-if="currentEntry.projectCategory" size="16px">
          <ProjectCategoryIcon :project-category="currentEntry.projectCategory" />
        </v-avatar>
        <span :class="{ 'rainbow-loading': loading }" v-text="displayProjectCategory" />
        <span style="padding: 0 8px 0;">></span>
      </div>
      <div v-if="displayProject" class="sub-title">
        <v-avatar v-if="currentEntry.project" size="16px">
          <ProjectIcon :project="currentEntry.project" />
        </v-avatar>
        <span :class="{ 'rainbow-loading': loading }" v-text="displayProject" />
      </div>
    </v-row>
    <v-row align="center" justify="center">
      <div v-if="!disabled" class="timer">
        <v-icon>mdi-timer</v-icon>
        <span :class="{ 'rainbow-loading': loading }" v-text="currentEntryTime" />
      </div>
      <div v-else class="timer" style="color: grey;">
        <v-icon color="grey">mdi-timer</v-icon>
        <span :class="{ 'rainbow-loading': loading }" v-text="currentEntryTime" />
      </div>
    </v-row>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from '~/node_modules/nuxt-property-decorator';
import { Entry } from '~/domain/timer/entity/Entry';
import ProjectIcon from '~/components/ProjectIcon.vue';
import ProjectCategoryIcon from '~/components/ProjectCategoryIcon.vue';

@Component({ components: { ProjectIcon, ProjectCategoryIcon } })
class CurrentTimeEntry extends Vue {
  @Prop()
  currentEntry: Entry;

  @Prop()
  disabled: boolean;

  @Prop()
  loading: boolean;

  currentEntryTime = '';
  timerSubscriberId: number;

  @Watch('currentEntry')
  countUp() {
    this.currentEntryTime = this.currentEntry.start.displayDiffFromNow();
  }

  created() {
    this.countUp();
    this.timerSubscriberId = window.setInterval(this.countUp, 1000);
  }

  beforeDestroy(): void {
    window.clearInterval(this.timerSubscriberId);
  }

  get displayEntry(): string {
    return this.currentEntry.description ?? 'What are you doing?';
  }

  get displayProjectCategory(): string | undefined {
    return this.currentEntry?.projectCategory?.nameWithoutBracket;
  }

  get displayProject(): string | undefined {
    if (!this.currentEntry) {
      return undefined;
    }
    if (!this.currentEntry.project) {
      return 'No project';
    }
    return this.currentEntry.project.nameWithoutBracket;
  }
}
export default CurrentTimeEntry;
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
