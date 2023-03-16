import Command from '@/lib/command';
import type { CommandContext, DiscordCommandContext, TwitchCommandContext } from '@/types/command';
import { CommandSource } from '@/types/command';

export default class PingCommand extends Command {
  name = 'ping';

  async run(context: CommandContext) {
    switch (context.source) {
      case CommandSource.Discord: {
        const c = context as DiscordCommandContext;
        const diff = c.message.client.ws.ping;
        return c.adapter.send(c, `Pong! Took ${diff}ms`);
      }
      case CommandSource.Twitch: {
        const c = context as TwitchCommandContext;
        const time = new Date(c.message.timestamp).getTime();
        const now = new Date().getTime();
        const diff = time - now;
        return c.adapter.send(c, `Pong! Took ${diff}ms`);
      }
      default: {
        return;
      }
    }
  }
}
