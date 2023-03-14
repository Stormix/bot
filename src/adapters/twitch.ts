import { Chat, ChatEvents } from 'twitch-js';
import Adapter from './adapter';

export default class TwitchAdapter extends Adapter {
  private client: Chat | null = null;
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

    await this.client.connect();
    await this.client.join(this.bot.config.env.TWITCH_USERNAME);
  }
}
