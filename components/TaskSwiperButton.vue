<template>
  <v-btn
    v-if="compact"
    outlined
    fab
    class="mx-2"
    x-small
    height="28"
    dark
    @click="handleClick"
  >
    <v-icon>{{ icon }}</v-icon>
  </v-btn>
  <v-btn v-else outlined class="mx-2" fab small dark @click="handleClick">
    <v-icon>{{ icon }}</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    icon: { type: String, required: true },
    compact: { type: Boolean },
  },
  setup(_props, context) {
    const handleClick = () => {
      context.emit("click");
    };

    return {
      handleClick,
    };
  },
});
</script>

<style lang="scss" scoped></style>
