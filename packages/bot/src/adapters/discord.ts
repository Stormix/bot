import type Bot from '@/lib/bot';
import { Adapters } from '@/types/adapter';
import type { DiscordCommandContext } from '@/types/command';
import { CommandSource } from '@/types/command';
import type { Message } from 'discord.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import type { Context } from 'vm';
import Adapter from '../lib/adapter';

export default class DiscordAdapter extends Adapter<DiscordCommandContext> {
  private client: Client | null = null;

  constructor(bot: Bot) {
    super(bot, Adapters.Discord);
  }

  atAuthor(message: Message) {
    return `<@${message.author.id}>`;
  }

  createContext(message: Message): DiscordCommandContext {
    return {
      source: CommandSource.Discord,
      atAuthor: this.atAuthor(message),
      atOwner: `<@${this.bot.config.env.DISCORD_OWNER_ID}>`,
      message,
      adapter: this
    };
  }

  getClient() {
    if (!this.client) throw new Error('Discord client is not initialized!');
    return this.client;
  }

  async send(context: Context, message: string) {
    if (!this.client) throw new Error('Discord client is not initialized!');
    await context.message.channel.send(message);
  }

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

    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(this.bot.config.prefix)) return;
      const args = message.content.slice(this.bot.config.prefix.length).trim().split(/ +/);

      const command = args.shift()?.toLowerCase();

      if (!command) return;

      await this.bot.processor.run(command, args, this.createContext(message));
    });

    this.client.on(Events.Warn, (warn) => {
      this.logger.warn(warn);
    });
    this.client.on(Events.Error, (error) => {
      this.logger.error(error);
    });

    await this.client.login(this.bot.config.env.DISCORD_TOKEN);
  }

  async stop() {
    if (!this.client) throw new Error('Discord client is not initialized!');
    this.client.destroy();
  }
}
