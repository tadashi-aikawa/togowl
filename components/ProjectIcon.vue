<template>
  <img :src="src.url" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Project } from '~/domain/timer/entity/Project';
import { Icon } from '~/domain/common/Icon';
import { timerStore } from '~/utils/store-accessor';

@Component({})
class ProjectIcon extends Vue {
  @Prop()
  project: Project;

  @Prop({ default: false })
  projectCategoryAsDefault: boolean;

  get src(): Icon {
    const projectIcon = timerStore.timerConfig?.getProjectIcon(this.project.id);
    if (projectIcon) {
      return projectIcon;
    }

    if (this.projectCategoryAsDefault && this.project.category) {
      const projectCategoryIcon = timerStore.timerConfig?.getProjectCategoryIcon(this.project.category.id);
      if (projectCategoryIcon) {
        return projectCategoryIcon;
      }
    }

    return Icon.create({
      url: 'https://a.slack-edge.com/production-standard-emoji-assets/10.2/google-medium/1f5c2-fe0f.png',
    });
  }
}
export default ProjectIcon;
</script>
