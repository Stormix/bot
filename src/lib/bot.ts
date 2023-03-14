import type Adapter from '@/adapters/adapter';
import DiscordAdapter from '@/adapters/discord';
import TwitchAdapter from '@/adapters/twitch';
import type { BotConfig } from '@/configs/bot';
import { defaultConfig } from '@/configs/bot';
import type CommandManager from './commandManager';
import type Logger from './logger';

class Bot {
  readonly config: BotConfig = defaultConfig;
  private readonly adapters: Adapter[] = [new TwitchAdapter(this), new DiscordAdapter(this)];

  constructor(public readonly logger: Logger, public readonly commandManager: CommandManager) {}

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
