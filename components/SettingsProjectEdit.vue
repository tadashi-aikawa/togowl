<template>
  <v-list style="padding: 10px;">
    <v-avatar tile size="24px" style="margin-right: 5px;">
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
      </v-btn>
    </v-row>
  </v-list>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  watch,
  watchEffect,
} from "@vue/composition-api";
import { Icon } from "~/domain/common/Icon";
import { Url } from "~/domain/common/Url";
import { ProjectId as TaskProjectId } from "~/domain/task/vo/ProjectId";
import { taskStore } from "~/utils/store-accessor";
import { Project as TaskProject } from "~/domain/task/entity/Project";

export default defineComponent({
  props: {
    name: { type: String, required: true },
    icon: { type: Object as () => Icon },
    taskProjectIds: { type: Array as () => TaskProjectId[] },
    showProjects: { type: Boolean },
  },
  setup(props, { emit }) {
    const state = reactive({
      inputText: "",
      iconUrl: "",
      iconEmoji: "",
      selectedTaskProjects: [] as TaskProject[],
      isValid: false,
      candidatedTaskProjects: computed(() => taskStore.projects),
    });

    const rules = reactive({
      iconUrl: [(v: string) => !v || Url.try(v).isRight() || "Invalid URL"],
      iconEmoji: [
        (v: string) => !v || !v.includes(":") || "Can not contain colons",
      ],
    });

    watchEffect(() => {
      state.iconUrl = props.icon?.url ?? "";
      state.iconEmoji = props.icon?.emoji ?? "";
    });
    watch(
      () => props.taskProjectIds,
      (ids) => {
        state.selectedTaskProjects = state.candidatedTaskProjects.filter(
          (x) => ids?.some((id) => x.id.equals(id)) ?? false
        );
      }
    );

    return {
      state,
      rules,
      save() {
        emit(
          "on-save",
          Icon.of({
            url: Url.try(state.iconUrl).orUndefined(),
            emoji: state.iconEmoji,
          }),
          state.selectedTaskProjects
        );
      },
    };
  },
});
</script>

<style scoped></style>
