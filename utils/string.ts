import marked from "marked";

export const trimBracketContents = (text: string): string =>
  text.replace(/ *\(.+\)/, "");
export const trimBracketTime = (text: string): string =>
  text.replace(/ *\([0-9]{1,2}:[0-9]{2}-?([0-9]{1,2}:[0-9]{2})?\)/, "");
export const trimBracketDate = (text: string): string =>
  text.replace(/ *\[x(\d{4}\/\d{1,2}\/\d{1,2}|\d{1,2}\/\d{1,2})\]/, "");

export const toMarkdown = (text: string): string =>
  marked(text, {
    breaks: true,
  });
