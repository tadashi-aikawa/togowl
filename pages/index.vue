<template>
  <v-layout column justify-center align-center>
    <template v-if="activeViewIndex === 0">
      <v-container style="padding: 0">
        <v-row no-gutters>
          <v-col :sm="12" :md="8">
            <v-flex>
              <v-fade-transition hide-on-leave>
                <div v-if="currentEntry" style="height: 220px">
                  <CurrentTimeEntry
                    :current-entry="currentEntry"
                    :disabled="!isTimeEntryTrusted"
                    :loading="isLoading"
                  />
                  <v-row
                    align="center"
                    justify="center"
                    style="margin-bottom: 20px"
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
                <div v-if="!currentEntry" style="height: 220px">
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
                      style="max-width: 480px; padding: 0 10px; margin: 0 10px"
                      @change="startFromSelector(selectedEntry)"
                    >
                      <template #selection="data">
                        <div style="padding: 5px; overflow: hidden">
                          <EntrySummary :entry="data.item" width="70vw" />
                        </div>
                      </template>
                      <template #item="data">
                        <div style="padding: 5px; overflow: hidden">
                          <EntrySummary :entry="data.item" />
                        </div>
                      </template>
                    </v-autocomplete>
                  </v-row>

                  <v-row
                    align="center"
                    justify="center"
                    style="padding-top: 20px"
                  >
                    <Clock />
                  </v-row>
                </div>
              </v-fade-transition>

              <v-row v-if="fetchingError" align="center" justify="center">
                <v-fade-transition>
                  <div style="padding: 15px">
                    <v-alert type="error">
                      {{ fetchingError.message }}
                    </v-alert>
                  </div>
                </v-fade-transition>
              </v-row>
              <v-row v-if="tasksError" align="center" justify="center">
                <div style="padding: 15px">
                  <v-alert type="error">
                    {{ tasksError.message }}
                  </v-alert>
                </div>
              </v-row>

              <v-row justify="center">
                <v-sheet tile class="task-area">
                  <v-img
                    width="100%"
                    :src="taskBackgroundImageUrl"
                    :style="{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      opacity: tasksBackgroundOpacity,
                      transition: 'opacity 1.0s',
                    }"
                  ></v-img>
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
      <div class="scheduler-area">
        <Scheduler
          :tasks="tasks"
          :loading="isTasksLoading"
          @on-change-order="updateTasksOrder"
        />
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
        <span>Scheduler</span>
        <v-icon>mdi-pen</v-icon>
      </v-btn>
    </v-bottom-navigation>

    <portal to="global-notification">
      <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="-1" top>
        {{ snackMessage }}
        <v-btn color="blue" text @click="snackbar = false"> Close </v-btn>
      </v-snackbar>
    </portal>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import {
  appStore,
  notificationStore,
  taskStore,
  timerStore,
} from "~/utils/store-accessor";
import { Entry } from "~/domain/timer/entity/Entry";
import { TogowlError } from "~/domain/common/TogowlError";
import { ActionStatus } from "~/domain/common/ActionStatus";
import CurrentTimeEntry from "~/components/CurrentTimeEntry.vue";
import TimeEntry from "~/components/TimeEntry.vue";
import EntrySummary from "~/components/EntrySummary.vue";
import TimeEntries from "~/components/TimeEntries.vue";
import { Task } from "~/domain/task/entity/Task";
import TaskEntryList from "~/components/TaskEntryList.vue";
import TaskDetail from "~/components/TaskDetail.vue";
import Scheduler from "~/components/Scheduler.vue";
import Clock from "~/components/Clock.vue";

@Component({
  components: {
    CurrentTimeEntry,
    TimeEntry,
    TimeEntries,
    TaskEntryList,
    TaskDetail,
    EntrySummary,
    Scheduler,
    Clock,
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

  async startFromSelector(entry: Entry) {
    this.waitForBlockedAction = true;
    const entryOrErr = await timerStore.startEntry(entry);
    this.waitForBlockedAction = false;

    if (entryOrErr.isLeft()) {
      this.showSnackBar(entryOrErr.error.message, true);
      return;
    }

    timerStore.increaseEntrySelectedCount(entry);

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

    if (task.urlEmbeddedOnTitle) {
      window.open(task.urlEmbeddedOnTitle.unwrap(), "_blank");
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

  get candidatedEntries(): Entry[] {
    return timerStore.candidatedEntries;
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

  get isTasksLoading(): boolean {
    return this.tasksStatus === "in_progress";
  }

  get disabledStart(): boolean {
    return !!this.currentEntry;
  }

  get taskBackgroundImageUrl(): string | undefined {
    return appStore.config.theme.taskBackgroundImageUrl;
  }

  get tasksBackgroundOpacity(): number {
    if (this.tasks.length > 30) {
      return 0;
    }
    if (this.tasks.length > 20) {
      return 0.1;
    }
    if (this.tasks.length > 10) {
      return 0.2;
    }
    if (this.tasks.length > 5) {
      return 0.3;
    }
    if (this.tasks.length > 0) {
      return 0.5;
    }
    return 1;
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
  position: relative;
  margin: 10px;
  padding: 5px;
  width: 100%;
  max-width: 650px;
  height: calc(#{$contents-height} - #{$current-entry-height} - 3px);
  overflow-y: scroll;
}

.scheduler-area {
  margin: 10px;
  padding: 5px;
  width: 100%;
  max-width: 650px;
  height: calc(#{$contents-height} - 25px);
  overflow-y: scroll;
}

.right-detail-area {
  margin-left: 20px;
  padding: 10px;
  height: calc(#{$contents-height} - 18px);
  background-color: #333333;
  overflow-y: scroll;
}
</style>
