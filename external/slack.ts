import { IncomingWebhook } from '@slack/webhook';

export async function send(webHookUrl: string, message: string, channel?: string) {
  const webHook = new IncomingWebhook(webHookUrl, {
    username: 'Togowl',
    icon_emoji: ':togowl:',
    channel,
  });
  await webHook.send(message);
}
