<template>
  <div v-if="notes">
    <template v-for="note in notes">
      <v-card :key="note.idAsNumber" class="card">
        <!--eslint-disable-next-line-->
        <div v-html="note.bodyAsMarkdown" />
      </v-card>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import { Task } from "~/domain/task/entity/Task";
import { Note } from "~/domain/task/entity/Note";

export default defineComponent({
  props: {
    task: { type: Object as () => Task },
  },
  setup(props, { emit }) {
    return {
      notes: computed<Note[] | undefined>(() => props.task?.notes),
      handleClickStartButton() {
        emit("on-click-start-button", props.task);
      },
    };
  },
});
</script>

<style scoped>
.card {
  color: antiquewhite;
  font-size: 80%;
  padding: 15px;
  margin-bottom: 5px;
}
</style>
