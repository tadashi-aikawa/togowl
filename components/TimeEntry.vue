<template>
  <v-list-item :key="entry.id.unwrap()">
    <v-list-item-content>
      <v-list-item-title>
        <EntrySummary :entry="entry" style="padding-bottom: 5px;" />
      </v-list-item-title>
      <v-list-item-subtitle class="sub-title">
        <span style="padding: 0 4px 0 0;"
          >{{ entry.start.displayTimeWithoutSeconds }} -
          {{ entry.stop.displayTimeWithoutSeconds }}</span
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
</template>

<script lang="ts">
import { Component, Prop, Vue } from "~/node_modules/nuxt-property-decorator";
import { Entry } from "~/domain/timer/entity/Entry";
import EntrySummary from "~/components/EntrySummary.vue";

@Component({
  components: { EntrySummary },
})
class TimeEntry extends Vue {
  @Prop()
  entry: Entry;

  handleClickPlayButton(entry: Entry) {
    this.$emit("on-click-start", entry);
  }
}
export default TimeEntry;
</script>

<style scoped>
.sub-title {
  font-size: 75%;
  color: darkgrey;
}
</style>
