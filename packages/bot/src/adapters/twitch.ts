import type Bot from '@/lib/bot';
import { Adapters } from '@/types/adapter';
import type { CommandContext, TwitchCommandContext } from '@/types/command';
import { CommandSource } from '@/types/command';
import type { PrivateMessage } from 'twitch-js';
import { Chat, ChatEvents, Commands } from 'twitch-js';
import fetchUtil from 'twitch-js/lib/utils/fetch';
import type { Context } from 'vm';
import Adapter from '../lib/adapter';

export default class TwitchAdapter extends Adapter<TwitchCommandContext> {
  client: Chat | null = null;

  constructor(bot: Bot) {
    super(bot, Adapters.Twitch);
  }

  atAuthor(message: PrivateMessage) {
    return `@${message.username}`;
  }

  isOwner(message: CommandContext['message']) {
    const username = (message as PrivateMessage).username;
    return username === this.bot.config.env.TWITCH_USERNAME;
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

  getClient() {
    if (!this.client) throw new Error('Twitch client is not initialized!');
    return this.client;
  }

  async send(context: Context, message: string): Promise<void> {
    if (!this.client) throw new Error('Twitch client is not initialized!');
    await this.client.say(context.message.channel, message);
  }

  async setup() {
    this.client = new Chat({
      username: this.bot.config.env.TWITCH_USERNAME,
      token: this.bot.config.env.TWITCH_ACCESS_TOKEN,
      onAuthenticationFailure: () =>
        fetchUtil('https://id.twitch.tv/oauth2/token', {
          method: 'post',
          search: {
            grant_type: 'refresh_token',
            refresh_token: this.bot.config.env.TWITCH_REFRESH_TOKEN,
            client_id: this.bot.config.env.TWITCH_CLIENT_ID,
            client_secret: this.bot.config.env.TWITCH_CLIENT_SECRET
          }
        }).then((response) => response.accessToken),
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

      await this.bot.processor.run(command, args, this.createContext(message as PrivateMessage));
    });

    await this.client.connect();
    await this.client.join(this.bot.config.env.TWITCH_CHANNEL);
  }

  async stop() {
    if (!this.client) throw new Error('Twitch client is not initialized!');
    await this.client.disconnect();
  }
}
