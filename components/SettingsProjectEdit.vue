<template>
  <v-list style="padding: 10px;">
    <v-avatar tile size="24px" style="margin-right: 5px;">
      <img v-if="iconUrl" :src="iconUrl" />
      <v-icon v-else small color="grey">mdi-help-circle-outline</v-icon>
    </v-avatar>
    <span v-text="name" />
    <v-form ref="form" v-model="isValid">
      <v-row align="center" justify="center">
        <v-col cols="10">
          <v-text-field
            v-model="iconUrl"
            :rules="iconUrlRules"
            label="Icon URL"
            placeholder="https://your/favorite/image.png"
            clearable
          />
          <v-text-field
            v-model="iconEmoji"
            :rules="iconEmojiRules"
            label="Icon Emoji"
            placeholder="smile"
            clearable
          />

          <v-autocomplete
            v-if="showProjects"
            v-model="selectedTaskProjects"
            :search-input.sync="inputText"
            :items="candidatedTaskProjects"
            :menu-props="{ maxHeight: 220 }"
            item-text="indexForSearch"
            label="Task projects"
            chips
            clearable
            multiple
            return-object
            @change="inputText = ''"
          >
            <template #selection="data">
              <v-chip>
                {{ data.item.name.unwrap() }}
              </v-chip>
            </template>
            <template #item="data">
              <v-chip>
                {{ data.item.name.unwrap() }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-form>

    <v-row align="center" justify="center">
      <v-btn :disabled="!isValid" color="success" class="mr-4" @click="save">
        Save
      </v-btn>
    </v-row>
  </v-list>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
  Watch,
} from "~/node_modules/nuxt-property-decorator";
import { Icon } from "~/domain/common/Icon";
import { Url } from "~/domain/common/Url";
import { ProjectId as TaskProjectId } from "~/domain/task/vo/ProjectId";
import { taskStore } from "~/utils/store-accessor";
import { Project as TaskProject } from "~/domain/task/entity/Project";

@Component({})
class SettingsProjectEdit extends Vue {
  @Prop()
  name: string;

  @Prop()
  icon?: Icon;

  @Prop()
  taskProjectIds?: TaskProjectId[];

  @Prop()
  showProjects: boolean;

  inputText = "";
  iconUrl: string = "";
  iconUrlRules = [(v: string) => !v || Url.try(v).isRight() || "Invalid URL"];

  iconEmoji: string = "";
  iconEmojiRules = [
    (v: string) => !v || !v.includes(":") || "Can not contain colons",
  ];

  selectedTaskProjects: TaskProject[] = [];

  isValid = false;

  get candidatedTaskProjects(): TaskProject[] {
    return taskStore.projects;
  }

  @Watch("icon", { immediate: true })
  updateFormValues() {
    this.iconUrl = this.icon?.url ?? "";
    this.iconEmoji = this.icon?.emoji ?? "";
  }

  @Watch("taskProjectIds", { immediate: true })
  onUpdateTaskProjectIds() {
    this.selectedTaskProjects = this.candidatedTaskProjects.filter(
      (x) => this.taskProjectIds?.some((id) => x.id.equals(id)) ?? false
    );
  }

  save() {
    this.$emit(
      "on-save",
      Icon.of({
        url: Url.try(this.iconUrl).orUndefined(),
        emoji: this.iconEmoji,
      }),
      this.selectedTaskProjects
    );
  }
}
export default SettingsProjectEdit;
</script>

<style scoped></style>
