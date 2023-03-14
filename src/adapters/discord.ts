import { Client, Events, GatewayIntentBits } from 'discord.js';
import Adapter from './adapter';

export default class DiscordAdapter extends Adapter {
  private client: Client | null = null;

  async setup() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent
      ]
    });
  }

  async listen() {
    if (!this.client) throw new Error('Discord client is not initialized!');
    this.client.once(Events.ClientReady, (c) => {
      this.bot.logger.debug(`Logged in to discord as ${c.user.tag}`);
    });
    await this.client.login(this.bot.config.env.DISCORD_TOKEN);
  }
}
