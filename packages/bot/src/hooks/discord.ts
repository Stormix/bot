import Hook from '@/lib/hook';
import { Adapters } from '@/types/adapter';
import type { Client } from 'discord.js';
import { ActivityType } from 'discord.js';

export default class DiscordHook extends Hook {
  async onStart() {
    // Get the discord adapter
    const adapter = this.bot.adapters.find((adapter) => adapter.name === Adapters.Discord);
    if (!adapter) {
      this.logger.error('Discord adapter not found');
      return;
    }

    // Get the discord client
    const client = adapter.getClient() as Client;

    // Set bot rich presence
    client.user?.setPresence({
      activities: [
        {
          name: `the game of 'how many humans can I convince that I'm not a robot.'`,
          type: ActivityType.Playing
        }
      ],
      status: 'dnd'
    });
  }
  async onStop() {
    // Do nothing
  }
}