import BuiltinCommand from '@/lib/command';
import type { CommandContext, DiscordCommandContext, TwitchCommandContext } from '@/types/command';
import { Adapters } from '@prisma/client';

export default class PingCommand extends BuiltinCommand {
  name = 'ping';

  async run(context: CommandContext) {
    switch (context.adapter.name) {
      case Adapters.DISCORD: {
        const c = context as DiscordCommandContext;
        const diff = c.message.client.ws.ping;
        return c.adapter.send(c, `Pong! Took ${diff}ms`);
      }
      case Adapters.TWITCH: {
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
