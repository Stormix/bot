import type Bot from '@/lib/bot';
import type { Context, TwitchContext } from '@/types/context';
import { Adapters } from '@prisma/client';
import type { BaseMessage, PrivateMessage } from 'twitch-js';
import { Chat, ChatEvents, Commands, OtherCommands } from 'twitch-js';
import fetchUtil from 'twitch-js/lib/utils/fetch';
import Adapter from '../lib/adapter';

export default class TwitchAdapter extends Adapter<TwitchContext> {
  client: Chat | null = null;

  constructor(bot: Bot) {
    super(bot, Adapters.TWITCH);
  }

  atAuthor(message: PrivateMessage | BaseMessage) {
    return `@${message.username}`;
  }

  isOwner(message: Context['message']) {
    const username = (message as PrivateMessage).username;
    return username === this.bot.config.env.TWITCH_USERNAME;
  }

  createContext(message: PrivateMessage | BaseMessage) {
    return {
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

  async send(message: string, context: Context) {
    if (!this.client) throw new Error('Twitch client is not initialized!');
    await this.client.say((context as TwitchContext).message.channel, message);
  }

  async message(message: string, context: Context) {
    if (!this.client) throw new Error('Twitch client is not initialized!');
    this.logger.debug(`Sending message to ${(context as TwitchContext).message.username}`);
    await this.client.whisper((context as TwitchContext).message.username, message); // DOESN'T WORK
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
      log: { level: 'warn' }
    });

    this.logger.info('Twitch adapter is ready!');
  }

  async listenForCommands() {
    this.client?.on(ChatEvents.ALL, async (message) => {
      if (!message) return;
      if (message.command !== Commands.PRIVATE_MESSAGE) return;
      if (!message.message.startsWith(this.bot.config.prefix)) return;
      const args = message.message.slice(this.bot.config.prefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();

      if (!command) return;

      await this.bot.processor.run(command, args, this.createContext(message as PrivateMessage));
    });
  }

  async listenForMessages() {
    this.client?.on(ChatEvents.ALL, async (message) => {
      if (!message) return;
      if (message.command !== OtherCommands.WHISPER) return;
      await this.message(message.message, this.createContext(message));
    });
  }
  async listen() {
    if (!this.client) throw new Error('Twitch client is not initialized!');

    this.client.once(ChatEvents.CONNECTED, (c) => {
      this.bot.logger.debug(`Logged in to twitch as ${c.username}`);
    });

    await this.listenForCommands();
    await this.listenForMessages();

    await this.client.connect();
    await this.client.join(this.bot.config.env.TWITCH_CHANNEL);
  }

  async stop() {
    if (!this.client) throw new Error('Twitch client is not initialized!');
    await this.client.disconnect();
  }
}
