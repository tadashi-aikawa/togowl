<template>
  <v-list two-line>
    <v-list-item v-for="entry in entries" :key="entry.id.value">
      <v-list-item-avatar>
        <v-img src="https://dl.dropboxusercontent.com/s/7muflol9doqsj0q/shachiku.png"></v-img>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          <EntrySummary :entry="entry" style="padding-bottom: 5px;" />
        </v-list-item-title>
        <v-list-item-subtitle class="sub-title">
          <span style="padding: 0 4px 0 0;"
            >{{ entry.start.displayTimeWithoutSeconds }} - {{ entry.stop.displayTimeWithoutSeconds }}</span
          >
          <v-icon size="small">mdi-timer</v-icon>
          <span>{{ entry.duration.asJapanese }}</span>
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn icon @click="handleClickPlayButton(entry)">
          <v-icon large>mdi-play-circle-outline</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>

    <v-overlay absolute :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-list>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Entry } from '~/domain/timer/entity/Entry';
import EntrySummary from '~/components/EntrySummary.vue';

@Component({
  components: { EntrySummary },
})
class TimeEntry extends Vue {
  @Prop()
  entries: Entry[];

  @Prop()
  loading: boolean;

  toSubtitle(entry: Entry): string {
    const project = entry.project?.nameWithoutBracket ?? '';
    const projectCategory = entry.projectCategory?.nameWithoutBracket ?? '';
    return projectCategory ? `${projectCategory} > ${project}` : project;
  }

  handleClickPlayButton(entry: Entry) {
    this.$emit('on-click-start', entry);
  }
}
export default TimeEntry;
</script>

<style scoped>
.sub-title {
  font-size: 80%;
  color: darkgrey;
}
</style>
