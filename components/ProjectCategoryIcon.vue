<template>
  <img :src="src.url" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from '~/node_modules/nuxt-property-decorator';
import { Icon } from '~/domain/common/Icon';
import { ProjectCategory } from '~/domain/timer/entity/ProjectCategory';

@Component({})
class ProjectCategoryIcon extends Vue {
  @Prop()
  projectCategory: ProjectCategory;

  get src(): Icon {
    return (
      this.projectCategory.icon ??
      Icon.create({ url: 'https://a.slack-edge.com/production-standard-emoji-assets/10.2/google-medium/1f465.png' })
    );
  }
}
export default ProjectCategoryIcon;
</script>
