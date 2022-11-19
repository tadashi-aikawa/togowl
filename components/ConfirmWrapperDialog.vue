<template>
  <v-dialog v-model="state.visible" max-width="290">
    <template #activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <slot></slot>
      </div>
    </template>
    <v-card>
      <v-card-title v-text="title" />
      <v-card-text v-html="description" />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="green darken-1"
          text
          @click="handleClickYes"
          v-text="yesLabel"
        />
        <v-btn
          color="green darken-1"
          text
          @click="handleClickNo"
          v-text="noLabel"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    yesLabel: { type: String, default: "Yes" },
    noLabel: { type: String, default: "No" },
    visible: { type: Boolean },
  },
  setup(props, context) {
    const state = reactive({
      visible: props.visible as boolean,
    });

    const handleClickYes = () => {
      state.visible = false;
      context.emit("confirm");
    };
    const handleClickNo = () => {
      state.visible = false;
    };

    return {
      state,
      handleClickYes,
      handleClickNo,
    };
  },
});
</script>

<style lang="scss" scoped></style>
