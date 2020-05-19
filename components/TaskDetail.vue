<template>
  <div v-if="notes">
    <template v-for="note in notes">
      <v-card :key="note.idAsNumber" class="card">
        <!--eslint-disable-next-line-->
        <div v-html="note.bodyAsMarkdown" class="markdown" />
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

<style lang="scss" scoped>
.card {
  color: antiquewhite;
  font-size: 80%;
  padding: 15px;
  margin-bottom: 5px;
}
</style>

<style lang="scss">
.markdown {
  h1 {
    margin: 0.67em 0;
  }
  h1,
  h2 {
    padding-bottom: 0.3em;
    border-bottom: 1px solid dimgrey;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }
  table {
    margin: 16px 0;
    display: block;
    width: 100%;
    overflow: auto;
    border-spacing: 0;
    border-collapse: collapse;

    th {
      font-weight: 600;
      padding: 5px 9px;
      background-color: dimgrey;
      border: 1px solid #333333;
    }
    td {
      padding: 5px 9px;
      border: 1px solid #333333;
    }
    tr {
      border: 1px solid #333333;
    }
  }
}
</style>
