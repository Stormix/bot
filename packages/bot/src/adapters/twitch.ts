import type Bot from '@/lib/bot';
import type { TwitchCommandContext } from '@/types/command';
import { CommandSource } from '@/types/command';
import type { PrivateMessage } from 'twitch-js';
import { Chat, ChatEvents, Commands } from 'twitch-js';
import type { Context } from 'vm';
import Adapter from './adapter';

export default class TwitchAdapter extends Adapter<TwitchCommandContext> {
  client: Chat | null = null;

  constructor(bot: Bot) {
    super(bot);
  }

  atAuthor(message: PrivateMessage) {
    return `@${message.username}`;
  }

  createContext(message: PrivateMessage): TwitchCommandContext {
    return {
      source: CommandSource.Twitch,
      atAuthor: this.atAuthor(message),
      atOwner: `@${this.bot.config.env.TWITCH_USERNAME}`,
      message,
      adapter: this
    };
  }

  async send(context: Context, message: string): Promise<void> {
    if (!this.client) throw new Error('Twitch client is not initialized!');
    await this.client.say(context.message.channel, message);
  }

  async setup() {
    this.client = new Chat({
      username: this.bot.config.env.TWITCH_USERNAME,
      token: this.bot.config.env.TWITCH_ACCESS_TOKEN,
      // TODO: setup refresh token mechanism
      log: { level: 'error' }
    });
  }

  async listen() {
    if (!this.client) throw new Error('Twitch client is not initialized!');

    this.client.once(ChatEvents.CONNECTED, (c) => {
      this.bot.logger.debug(`Logged in to twitch as ${c.username}`);
    });

    this.client.on(ChatEvents.ALL, async (message) => {
      // if (message.isSelf) return; // TODO: make a bot account on twitch
      if (message.command !== Commands.PRIVATE_MESSAGE) return;
      if (!message.message.startsWith(this.bot.config.prefix)) return;
      const args = message.message.slice(this.bot.config.prefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();

      if (!command) return;

      await this.bot.commandManager.run(command, args, this.createContext(message as PrivateMessage));
    });

    await this.client.connect();
    await this.client.join(this.bot.config.env.TWITCH_USERNAME);
  }

  async stop() {
    if (!this.client) throw new Error('Twitch client is not initialized!');
    await this.client.disconnect();
  }
}
