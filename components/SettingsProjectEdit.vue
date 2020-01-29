<template>
  <v-list style="padding: 10px;">
    <v-avatar size="24px" style="margin-right: 5px;">
      <img v-if="iconUrl" :src="iconUrl" />
      <v-icon v-else small color="grey">mdi-help-circle-outline</v-icon>
    </v-avatar>
    <span v-text="name" />
    <v-form ref="form" v-model="isValid">
      <v-row align="center" justify="center">
        <v-col cols="10">
          <v-text-field
            v-model="iconUrl"
            :rules="iconUrlRules"
            label="Icon URL"
            placeholder="https://your/favorite/image.png"
            clearable
          />
          <v-text-field v-model="iconEmoji" :rules="iconEmojiRules" label="Icon Emoji" placeholder="smile" clearable />
        </v-col>
      </v-row>
    </v-form>

    <v-row align="center" justify="center">
      <v-btn :disabled="!isValid" color="success" class="mr-4" @click="save">
        Save
      </v-btn>
    </v-row>
  </v-list>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from '~/node_modules/nuxt-property-decorator';
import { Icon } from '~/domain/common/Icon';
import { Url } from '~/domain/common/Url';

@Component({})
class SettingsProjectEdit extends Vue {
  @Prop()
  name: string;

  @Prop()
  icon?: Icon;

  iconUrl: string = '';
  iconUrlRules = [(v: string) => !v || Url.isValid(v) || 'Invalid URL'];

  iconEmoji: string = '';
  iconEmojiRules = [(v: string) => !v || !v.includes(':') || 'Do not contain colon'];

  isValid = false;

  @Watch('icon', { immediate: true })
  updateFormValues() {
    this.iconUrl = this.icon?.url ?? '';
    this.iconEmoji = this.icon?.emoji ?? '';
  }

  save() {
    this.$emit('on-save', Icon.create({ url: this.iconUrl, emoji: this.iconEmoji }));
  }
}
export default SettingsProjectEdit;
</script>

<style scoped></style>
