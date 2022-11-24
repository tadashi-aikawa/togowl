<template>
  <div>
    <div class="entry markdown" v-html="titleHtml" />
    <ProjectSummary v-if="project" :project="project" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { Entry } from "~/domain/timer/entity/Entry";
import ProjectSummary from "~/components/ProjectSummary.vue";
import { Project } from "~/domain/timer/entity/Project";
import { HtmlString } from "~/domain/common/HtmlString";

export default defineComponent({
  components: {
    ProjectSummary,
  },
  props: {
    entry: { type: Object as () => Entry, required: true },
  },
  setup(props) {
    return {
      titleHtml: computed((): HtmlString => props.entry.descriptionAsMarkdown),
      project: computed((): Project | undefined => props.entry.project),
    };
  },
});
</script>

<style scoped>
.entry {
  font-size: 95% !important;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-bottom: 3px;
}
</style>
