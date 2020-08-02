<template>
  <v-autocomplete
    :value="value"
    :items="labels"
    :filter="customFilter"
    :menu-props="{ maxHeight: 300 }"
    :search-input.sync="state.inputText"
    item-text="name"
    color="cyan"
    item-color="cyan"
    full-width
    return-object
    hint="Labels"
    persistent-hint
    multiple
    dark
    dense
    clearable
    prepend-icon="mdi-tag"
    @change="handleChangeLabels"
  >
    <template #selection="data">
      <v-chip class="ma-1" x-small dark>
        {{ data.item.name }}
      </v-chip>
    </template>
    <template #item="data">
      <v-chip class="ma-1" x-small dark>
        {{ data.item.name }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from "@vue/composition-api";
import { taskStore } from "~/utils/store-accessor";
import { Label } from "~/domain/task/entity/Label";

export default defineComponent({
  props: {
    value: { type: Array as () => Label[] },
  },
  setup(_props, context) {
    const state = reactive({
      inputText: "",
    });

    const labels = computed(() => taskStore.labels);

    const customFilter = (label: Label, queryText: string): boolean => {
      const labelName = label.name.toLowerCase();
      return queryText
        .toLowerCase()
        .split(" ")
        .every((q) => labelName.includes(q));
    };

    const handleChangeLabels = (labels: Label[]) => {
      state.inputText = "";
      context.emit("input", labels);
    };

    return {
      state,
      labels,
      customFilter,
      handleChangeLabels,
    };
  },
});
</script>

<style lang="scss" scoped>
.project-name {
  font-size: 85%;
  display: block;
}
.pbroject-id {
  font-size: 60%;
  color: grey;
  display: block;
}
.label {
  display: inline;
  white-space: initial;
}
</style>
