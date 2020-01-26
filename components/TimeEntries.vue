<template>
  <v-slide-y-transition group>
    <TimeEntry v-for="entry in entries" :key="entry.id.value" :entry="entry" @on-click-start="handleClickPlayButton" />
    <v-overlay key="loading" absolute :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-slide-y-transition>
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Entry } from '~/domain/timer/entity/Entry';
import TimeEntry from '~/components/TimeEntry.vue';

@Component({
  components: { TimeEntry },
})
class TimeEntries extends Vue {
  @Prop()
  entries: Entry[];

  @Prop({ default: false })
  loading: boolean;

  handleClickPlayButton(entry: Entry) {
    this.$emit('on-click-start', entry);
  }
}
export default TimeEntries;
</script>
