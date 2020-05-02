import { IncomingWebhook } from "@slack/webhook";

type Result = "ok" | string;

export async function send(
  webHookUrl: string,
  message: string,
  userName: string,
  iconEmoji: string,
  channel?: string
): Promise<Result> {
  const webHook = new IncomingWebhook(webHookUrl, {
    username: userName,
    icon_emoji: iconEmoji,
    channel,
  });
  return (await webHook.send(message)).text;
}
