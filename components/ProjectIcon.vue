<template>
  <img :src="src" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Project } from '~/domain/timer/entity/Project';

@Component({})
class ProjectIcon extends Vue {
  @Prop()
  project: Project;

  @Prop({ default: false })
  projectCategoryAsDefault: boolean;

  get src(): string {
    if (this.project.icon?.url) {
      return this.project.icon.url;
    }

    if (this.projectCategoryAsDefault && this.project.category?.icon?.url) {
      return this.project.category.icon.url;
    }

    return 'https://a.slack-edge.com/production-standard-emoji-assets/10.2/google-medium/1f5c2-fe0f.png';
  }
}
export default ProjectIcon;
</script>
