<script lang="ts" setup>
import { computed, reactive, watch } from "vue";
import { Icon } from "~/domain/common/Icon";
import { Url } from "~/domain/common/Url";
import { ProjectId as TaskProjectId } from "~/domain/task/vo/ProjectId";
import { taskStore } from "~/utils/store-accessor";
import { TaskProject } from "~/domain/task/entity/TaskProject";
import { Color } from "~/domain/common/Color";

interface Props {
  name: string;
  icon?: Icon;
  color?: Color;
  taskProjectIds?: TaskProjectId[];
  showColor: boolean;
  showProjects: boolean;
}
const props = defineProps<Props>();

interface State {
  inputText: string;
  iconUrl: string;
  iconEmoji: string;
  color: string;
  selectedTaskProjects: TaskProject[];
  isValid: boolean;
  candidatedTaskProjects: TaskProject[];
}

const state = reactive<State>({
  inputText: "",
  iconUrl: "",
  iconEmoji: "",
  color: "",
  selectedTaskProjects: [],
  isValid: false,
  candidatedTaskProjects: [],
}) as State;

watch(
  () => props,
  (props) => {
    state.iconUrl = props.icon?.url ?? "";
    state.iconEmoji = props.icon?.emoji ?? "";
    state.color = props.color?.unwrap() ?? "";
    state.candidatedTaskProjects = taskStore.projects;
    state.selectedTaskProjects = state.candidatedTaskProjects.filter(
      (x) => props.taskProjectIds?.some((id) => x.id.equals(id)) ?? false
    );
  },
  { deep: true, immediate: true }
);

const rules = reactive({
  iconUrl: [(v: string) => !v || Url.try(v).isRight() || "Invalid URL"],
  iconEmoji: [
    (v: string) => !v || !v.includes(":") || "Can not contain colons",
  ],
});

const previewColor = computed(() => state.color);

const emit = defineEmits<{
  (e: "on-save", icon: Icon, color: Color, projects: TaskProject[]): void;
}>();

const save = () => {
  emit(
    "on-save",
    Icon.of({
      url: Url.try(state.iconUrl).orUndefined(),
      emoji: state.iconEmoji,
    }),
    Color.of(state.color),
    state.selectedTaskProjects
  );
};
</script>

<template>
  <v-list style="padding: 10px">
    <v-avatar tile size="24px" style="margin-right: 5px">
      <img v-if="state.iconUrl" :src="state.iconUrl" />
      <v-icon v-else small color="grey">mdi-help-circle-outline</v-icon>
    </v-avatar>
    <span v-text="name" />
    <v-form ref="form" v-model="state.isValid">
      <v-row align="center" justify="center">
        <v-col cols="10">
          <v-text-field
            v-model="state.iconUrl"
            :rules="rules.iconUrl"
            label="Icon URL"
            placeholder="https://your/favorite/image.png"
            clearable
          />
          <v-text-field
            v-model="state.iconEmoji"
            :rules="rules.iconEmoji"
            label="Icon Emoji"
            placeholder="smile"
            clearable
          />
          <v-text-field
            v-if="showColor"
            v-model="state.color"
            label="Color"
            :background-color="previewColor"
            placeholder="Ex: #77AA33, rgba(255,0,0,0.5), red"
            clearable
          />

          <v-autocomplete
            v-if="showProjects"
            v-model="state.selectedTaskProjects"
            :search-input.sync="state.inputText"
            :items="state.candidatedTaskProjects"
            :menu-props="{ maxHeight: 220 }"
            item-text="indexForSearch"
            label="Task projects"
            chips
            clearable
            multiple
            return-object
            @change="state.inputText = ''"
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
      <v-btn
        :disabled="!state.isValid"
        color="success"
        class="mr-4"
        @click="save"
      >
        Save
        <v-icon right dark>mdi-cloud-upload</v-icon>
      </v-btn>
    </v-row>
  </v-list>
</template>
