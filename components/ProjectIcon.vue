<template>
  <img :src="src" />
</template>
<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import { Project } from "~/domain/timer/entity/Project";

export default defineComponent({
  props: {
    project: {
      type: Object as () => Project,
      required: true,
    },
    projectCategoryAsDefault: {
      type: Boolean,
      default: false,
    },
  },
  setup({ project, projectCategoryAsDefault }) {
    return {
      src: computed((): string => {
        if (project.icon?.url) {
          return project.icon.url;
        }

        if (projectCategoryAsDefault && project.category?.icon?.url) {
          return project.category.icon.url;
        }

        return "https://a.slack-edge.com/production-standard-emoji-assets/10.2/google-medium/1f5c2-fe0f.png";
      }),
    };
  },
});
</script>
