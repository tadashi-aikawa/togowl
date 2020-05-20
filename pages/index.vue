<template>
  <v-layout column justify-center align-center>
    <template v-if="activeViewIndex === 0">
      <v-container style="padding: 0;">
        <v-row no-gutters>
          <v-col :sm="12" :md="8">
            <v-flex>
              <v-fade-transition hide-on-leave>
                <div v-if="currentEntry" style="height: 220px;">
                  <CurrentTimeEntry
                    :current-entry="currentEntry"
                    :disabled="!isTimeEntryTrusted"
                    :loading="isLoading"
                  />
                  <v-row
                    align="center"
                    justify="center"
                    style="margin-bottom: 20px;"
                  >
                    <v-btn
                      class="mx-2"
                      fab
                      small
                      dark
                      color="purple darken-1"
                      :disabled="!canAction"
                      @click="cancel"
                    >
                      <v-icon dark>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn
                      class="mx-2"
                      fab
                      small
                      dark
                      color="grey darken-1"
                      :disabled="!canAction"
                      @click="pause"
                    >
                      <v-icon dark>mdi-pause</v-icon>
                    </v-btn>
                    <v-btn
                      class="mx-2"
                      fab
                      small
                      dark
                      color="teal"
                      :disabled="!canAction"
                      @click="complete"
                    >
                      <v-icon dark>mdi-check-bold</v-icon>
                    </v-btn>
                    <v-btn
                      class="mx-2"
                      fab
                      small
                      dark
                      color="brown darken-1"
                      :disabled="!canAction"
                      @click="connectPrevious"
                    >
                      <v-icon dark>mdi-transit-connection-variant</v-icon>
                    </v-btn>
                  </v-row>
                </div>
              </v-fade-transition>
              <v-fade-transition hide-on-leave>
                <div v-if="!currentEntry" style="height: 220px;">
                  <v-row align="center" justify="center">
                    <v-autocomplete
                      v-model="selectedEntry"
                      :items="candidatedEntries"
                      :filter="customFilter"
                      :menu-props="{ maxHeight: 220, maxWidth: 480 }"
                      item-text="hashAsTask"
                      placeholder="Search entries past"
                      full-width
                      return-object
                      style="max-width: 480px;"
                      @change="start(selectedEntry)"
                    >
                      <template #selection="data">
                        <div style="padding: 5px;">
                          <EntrySummary :entry="data.item" width="70vw" />
                        </div>
                      </template>
                      <template #item="data">
                        <div style="padding: 5px;">
                          <EntrySummary :entry="data.item" />
                        </div>
                      </template>
                    </v-autocomplete>
                  </v-row>

                  <v-row>
                    <swiper
                      :options="subActionSwiperOption"
                      style="height: 83px; max-width: 480px; width: 100%;"
                    >
                      <template v-for="entry in latest5Entries">
                        <swiper-slide :key="entry.id.unwrap()">
                          <TimeEntry :entry="entry" @on-click-start="start" />
                        </swiper-slide>
                      </template>
                    </swiper>
                  </v-row>
                </div>
              </v-fade-transition>

              <v-row v-if="fetchingError" align="center" justify="center">
                <v-fade-transition>
                  <div style="padding: 15px;">
                    <v-alert type="error">
                      {{ fetchingError.message }}
                    </v-alert>
                  </div>
                </v-fade-transition>
              </v-row>
              <v-row v-if="tasksError" align="center" justify="center">
                <div style="padding: 15px;">
                  <v-alert type="error">
                    {{ tasksError.message }}
                  </v-alert>
                </div>
              </v-row>

              <v-row justify="center">
                <v-sheet tile class="task-area">
                  <TaskEntryList
                    :tasks="tasks"
                    :loading="isTasksLoading"
                    :disabled-start="disabledStart"
                    @on-click-start="startFromTask"
                    @on-change-order="updateTasksOrder"
                  />
                </v-sheet>
              </v-row>
            </v-flex>

            <v-snackbar
              v-model="snackbar"
              :color="snackbarColor"
              :timeout="3000"
              top
            >
              {{ snackMessage }}
              <v-btn color="blue" text @click="snackbar = false">
                Close
              </v-btn>
            </v-snackbar>
          </v-col>

          <v-col v-if="$vuetify.breakpoint.mdAndUp" :md="4">
            <div class="right-detail-area">
              <TaskDetail :task="taskRelatedToCurrentEntry" />
            </div>
          </v-col>
        </v-row>
      </v-container>

      <v-overlay :value="waitForBlockedAction">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </template>

    <template v-else-if="activeViewIndex === 1">
      <div class="calendar-area">
        <EntryCalendar :entries="entries" :height="calendarHeight" />
      </div>
    </template>

    <v-bottom-navigation
      v-model="activeViewIndex"
      grow
      color="teal"
      dark
      shift
      fixed
    >
      <v-btn>
        <span>Timer</span>
        <v-icon>mdi-clock</v-icon>
      </v-btn>
      <v-btn>
        <span>Calendar</span>
        <v-icon>mdi-calendar</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import {
  notificationStore,
  taskStore,
  timerStore,
} from "~/utils/store-accessor";
import { Entry } from "~/domain/timer/entity/Entry";
import { TogowlError } from "~/domain/common/TogowlError";
import { ActionStatus } from "~/domain/common/ActionStatus";
import CurrentTimeEntry from "~/components/CurrentTimeEntry.vue";
import TimeEntry from "~/components/TimeEntry.vue";
import EntryCalendar from "~/components/EntryCalendar.vue";
import EntrySummary from "~/components/EntrySummary.vue";
import TimeEntries from "~/components/TimeEntries.vue";
import { Task } from "~/domain/task/entity/Task";
import TaskEntryList from "~/components/TaskEntryList.vue";
import TaskDetail from "~/components/TaskDetail.vue";

@Component({
  components: {
    CurrentTimeEntry,
    TimeEntry,
    TimeEntries,
    TaskEntryList,
    EntryCalendar,
    EntrySummary,
    TaskDetail,
  },
})
class Root extends Vue {
  activeViewIndex = 0;

  snackbar = false;
  snackbarColor: string | null = null;
  snackMessage = "";
  waitForBlockedAction = false;

  selectedEntry: Entry | null = null;

  subActionSwiperOption = {
    direction: "vertical",
    effect: "cube",
  };

  showSnackBar(message: string, error: boolean) {
    this.snackMessage = message;
    this.snackbarColor = error ? "error" : null;
    this.snackbar = true;
  }

  async start(entry: Entry) {
    this.waitForBlockedAction = true;
    const entryOrErr = await timerStore.startEntry(entry);
    this.waitForBlockedAction = false;

    if (entryOrErr.isLeft()) {
      this.showSnackBar(entryOrErr.error.message, true);
      return;
    }

    const err = await notificationStore.notifyStartEvent(entry);
    if (err) {
      this.showSnackBar(err.message, true);
    }
  }

  async startFromTask(task: Task) {
    this.waitForBlockedAction = true;
    const entryOrErr = await timerStore.startEntryByTask(task);
    this.waitForBlockedAction = false;

    if (entryOrErr.isLeft()) {
      this.showSnackBar(entryOrErr.error.message, true);
      return;
    }

    const err = await notificationStore.notifyStartEvent(entryOrErr.value);
    if (err) {
      this.showSnackBar(err.message, true);
    }
  }

  async complete() {
    this.waitForBlockedAction = true;
    const entryOrErr = await timerStore.completeCurrentEntry();
    this.waitForBlockedAction = false;

    if (entryOrErr.isLeft()) {
      this.showSnackBar(entryOrErr.error.message, true);
      return;
    }

    this.selectedEntry = null;
    const err = await notificationStore.notifyDoneEvent(entryOrErr.value);
    if (err) {
      this.showSnackBar(err.message, true);
    }
  }

  async pause() {
    this.waitForBlockedAction = true;
    const entryOrErr = await timerStore.pauseCurrentEntry();
    this.waitForBlockedAction = false;

    if (entryOrErr.isLeft()) {
      this.showSnackBar(entryOrErr.error.message, true);
      return;
    }

    this.selectedEntry = null;

    const err = await notificationStore.notifyPauseEvent(entryOrErr.value);
    if (err) {
      this.showSnackBar(err.message, true);
    }
  }

  async connectPrevious() {
    this.waitForBlockedAction = true;
    await timerStore.connectPreviousEntry();
    this.waitForBlockedAction = false;
  }

  async cancel() {
    this.waitForBlockedAction = true;
    const entryOrErr = await timerStore.cancelCurrentEntry();
    this.waitForBlockedAction = false;

    if (entryOrErr.isLeft()) {
      this.showSnackBar(entryOrErr.error.message, true);
      return;
    }

    this.selectedEntry = null;
    const err = await notificationStore.notifyCancelEvent();
    if (err) {
      this.showSnackBar(err.message, true);
    }
  }

  async updateTasksOrder(tasks: Task[]) {
    await taskStore.updateTasksOrder(tasks);
  }

  get fetchingStatus(): ActionStatus {
    return timerStore.fetchingStatus;
  }

  get fetchingError(): TogowlError | null {
    return timerStore.fetchingError;
  }

  get currentEntry(): Entry | null {
    return timerStore.currentEntry;
  }

  get taskRelatedToCurrentEntry(): Task | null {
    return timerStore.taskRelatedToCurrentEntry;
  }

  get entries(): Entry[] {
    return timerStore.entries;
  }

  get latest5Entries(): Entry[] {
    return timerStore.entriesWithDayOrders.slice(0, 5);
  }

  get candidatedEntries(): Entry[] {
    return timerStore.candidatedEntries;
  }

  get entriesStatus(): ActionStatus {
    return timerStore.entryByIdStatus;
  }

  get entriesError(): TogowlError | null {
    return timerStore.entryByIdError;
  }

  get tasks(): Task[] {
    return taskStore.tasksOrderAsDay;
  }

  get tasksStatus(): ActionStatus {
    return taskStore.status;
  }

  get tasksError(): TogowlError | null {
    return taskStore.error;
  }

  get isRealtimeEnabled(): boolean {
    return timerStore.realtime;
  }

  get isTimeEntryTrusted(): boolean {
    return this.isRealtimeEnabled && this.fetchingStatus === "success";
  }

  get canAction(): boolean {
    return this.isTimeEntryTrusted && !!this.currentEntry;
  }

  get isLoading(): boolean {
    return this.fetchingStatus === "in_progress";
  }

  get isEntriesLoading(): boolean {
    return this.entriesStatus === "in_progress" && this.entries.length === 0;
  }

  get isTasksLoading(): boolean {
    return this.tasksStatus === "in_progress" && this.tasks.length === 0;
  }

  get disabledStart(): boolean {
    return !!this.currentEntry;
  }

  get calendarHeight(): string {
    return "calc(100vh - 80px - 56px)";
  }

  customFilter(item: Entry, queryText: string): boolean {
    const description = item.description.toLowerCase();
    const projectName = item.project?.name.unwrap().toLowerCase();
    const projectCategoryName = item.projectCategory?.name
      .unwrap()
      .toLowerCase();

    return queryText
      .toLowerCase()
      .split(" ")
      .every(
        (q) =>
          description.includes(q) ||
          projectName?.includes(q) ||
          projectCategoryName?.includes(q)
      );
  }
}

export default Root;
</script>

<style lang="scss" scoped>
$current-entry-height: 12px + 220px + 12px;

.task-area {
  margin: 10px;
  padding: 5px;
  width: 100%;
  max-width: 650px;
  height: calc(#{$contents-height} - #{$current-entry-height} - 3px);
  overflow-y: scroll;
}

.calendar-area {
  padding: 5px;
  width: 100%;
}

.right-detail-area {
  margin-left: 20px;
  padding: 10px;
  height: calc(#{$contents-height} - 18px);
  background-color: #333333;
  overflow-y: scroll;
}
</style>
