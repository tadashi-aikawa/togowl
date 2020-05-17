import marked from "marked";
const joypixels = require("emoji-toolkit") as any;

export const trimBracketContents = (text: string): string =>
  text.replace(/ *\(.+\)/, "");
export const trimBracketTime = (text: string): string =>
  text.replace(/ *\([0-9]{1,2}:[0-9]{2}-?([0-9]{1,2}:[0-9]{2})?\)/, "");
export const trimBracketDate = (text: string): string =>
  text.replace(/ *\[x(\d{4}\/\d{1,2}\/\d{1,2}|\d{1,2}\/\d{1,2})\]/, "");
export const trimPrefixEmoji = (text: string): string =>
  text.replace(/^ *:[^:]+: */, "");

export const toEmojiString: (text: string) => string =
  joypixels.shortnameToImage;

export const toMarkdown = (text: string): string =>
  marked(text, {
    breaks: true,
  });
