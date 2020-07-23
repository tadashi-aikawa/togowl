import { HtmlString } from "~/domain/common/HtmlString";
import { Url } from "~/domain/common/Url";

const marked = require("marked");
const defaultRenderer = new marked.Renderer();
const InlineRenderer = new marked.Renderer();
InlineRenderer.paragraph = (text: string) => `${text}\n`;

export const trimBracketContents = (text: string): string =>
  text.replace(/ +\(.+\)/, "");
export const trimBracketTime = (text: string): string =>
  text.replace(/ +\([0-9]{1,2}:[0-9]{2}-?([0-9]{1,2}:[0-9]{2})?\)/, "");
export const trimBracketDate = (text: string): string =>
  text.replace(/ +\[x(\d{4}\/\d{1,2}\/\d{1,2}|\d{1,2}\/\d{1,2})]/, "");

export const toHTML = (markdown: string, inline: boolean = false): HtmlString =>
  marked(markdown, {
    breaks: true,
    renderer: inline ? InlineRenderer : defaultRenderer,
  });

export const markdownToSlack = (markdownText: string): string =>
  markdownText
    .replace(/(.*)(^| )(https?:\/\/[^ ]+)(.*)/, "$1$2<$3>$4")
    .replace(/([^[]*)\[(.+)]\(([^)]+)\)(.*)/, "$1<$3|$2>$4");

export const todoistToMarkdown = (todoistText: string): string =>
  todoistText.replace(/(https?:\/\/[^ ]+) \(([^)]+)\)/g, "[$2]($1)");

export const pickUrl = (markdownText: string): Url | undefined =>
  Url.try(
    markdownText.match(/\[.+]\((?<url>.+)\)/)?.groups?.url ?? "invalid_url"
  ).orUndefined();
