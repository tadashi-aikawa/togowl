<template>
  <v-form ref="form" v-model="state.isValid">
    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="state.taskBackgroundImageUrl"
          :rules="taskBackgroundImageUrlRules"
          label="Background image url of task list"
          placeholder="https://your-favorite-image.png"
          clearable
        />
      </v-col>
      <v-img :src="state.taskBackgroundImageUrl" max-width="70%" />
    </v-row>

    <v-row align="center" justify="center" style="padding: 10px;">
      <v-btn
        :disabled="!state.isValid"
        color="success"
        class="mr-4"
        :loading="isAppConfigUpdating"
        @click="saveAppConfig"
      >
        Save
      </v-btn>

      <div style="padding: 15px;">
        <v-alert v-if="appConfigUpdateError" type="error">
          {{ appConfigUpdateError.message }}
        </v-alert>
      </div>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
} from "@vue/composition-api";
import { appStore } from "~/utils/store-accessor";
import { Theme } from "~/domain/app/vo/Theme";
import { Url } from "~/domain/common/Url";

export default defineComponent({
  setup() {
    const taskBackgroundImageUrlRules = [
      (v: string) => Url.try(v).isRight() || "Invalid URL",
    ];

    const state = reactive({
      isValid: false,
      taskBackgroundImageUrl: "",
    });

    const isAppConfigUpdating = computed(
      () => appStore.status === "in_progress"
    );
    const appConfigUpdateError = computed(() => appStore.error);

    const saveAppConfig = () =>
      appStore.updateTheme(
        Theme.of({
          taskBackgroundImageUrl: Url.try(
            state.taskBackgroundImageUrl
          ).orThrow(),
        })
      );

    onMounted(() => {
      state.taskBackgroundImageUrl =
        appStore.config.theme.taskBackgroundImageUrl ?? "";
    });

    return {
      taskBackgroundImageUrlRules,
      state,
      isAppConfigUpdating,
      appConfigUpdateError,
      saveAppConfig,
    };
  },
});
</script>

<style scoped></style>
