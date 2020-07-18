<template>
  <v-dialog
    v-model="state.visible"
    :return-value.sync="state.date"
    width="290px"
  >
    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <slot></slot>
      </div>
    </template>
    <v-date-picker
      v-model="state.date"
      color="green darken-2"
      first-day-of-week="1"
      scrollable
      @click:date="selectDate"
    >
      <v-spacer></v-spacer>
    </v-date-picker>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";

export default defineComponent({
  props: {
    date: { type: String, required: true },
    visible: { type: Boolean },
  },
  setup(props, context) {
    const state = reactive({
      date: props.date,
      visible: props.visible,
    });

    const selectDate = () => {
      state.visible = false;
      context.emit("select-date", state.date);
    };

    return {
      state,
      selectDate,
    };
  },
});
</script>

<style lang="scss" scoped></style>
