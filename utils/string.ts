// TODO: test, toEmojiString, https://github.com/tadashi-aikawa/togowl/blob/master/src/utils/string.ts
export const trimBracketContents = (text: string): string => text.replace(/\(.+\)/, '');
export const trimBracketTime = (text: string): string =>
  text.replace(/ *\([0-9]{1,2}:[0-9]{2}-?([0-9]{1,2}:[0-9]{2})?\)/, '');
export const trimBracketDate = (text: string): string =>
  text.replace(/ *\[x(\d{4}\/\d{1,2}\/\d{1,2}|\d{1,2}\/\d{1,2})\]/, '');
export const trimPrefixEmoji = (text: string): string => text.replace(/^ *:[^:]+: */, '');
