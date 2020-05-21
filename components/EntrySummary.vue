<template>
  <div>
    <div class="entry" v-text="title" />
    <ProjectSummary v-if="project" :project="project" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import { Entry } from "~/domain/timer/entity/Entry";
import ProjectSummary from "~/components/ProjectSummary.vue";
import { Project } from "~/domain/timer/entity/Project";

export default defineComponent({
  components: {
    ProjectSummary,
  },
  props: {
    entry: { type: Object as () => Entry, required: true },
  },
  setup(props) {
    return {
      title: computed((): string => props.entry.description),
      project: computed((): Project | undefined => props.entry.project),
    };
  },
});
</script>

<style scoped>
.entry {
  font-size: 100% !important;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-bottom: 3px;
}
</style>
