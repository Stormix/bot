import Adapter from '@/adapters/adapter';

import { ILogObj, Logger } from 'tslog';
import { Inject, Service } from 'typedi';
import DiscordAdapter from './adapters/discord';
import TwitchAdapter from './adapters/twitch';
import { BotConfig, defaultConfig } from './configs/bot';

@Service()
class Bot {
  readonly config: BotConfig = defaultConfig;
  private readonly adapters: Adapter[] = [new TwitchAdapter(this), new DiscordAdapter(this)];

  @Inject('logger')
  readonly logger!: Logger<ILogObj>;

  async setup() {
    this.logger.debug('Setting up bot...');

    for (const adapter of this.adapters) {
      await adapter.setup();
    }
  }

  async listen() {
    await this.setup();

    this.logger.debug('Loaded', this.config.env.NODE_ENV, 'config');

    for (const adapter of this.adapters) {
      await adapter.listen();
    }
  }
}

export default Bot;
