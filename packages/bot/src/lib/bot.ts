import DiscordAdapter from '@/adapters/discord';
import TwitchAdapter from '@/adapters/twitch';
import type { BotConfig } from '@/config/bot';
import { defaultConfig } from '@/config/bot';
import CommandManager from './commandManager';
import Logger from './logger';

class Bot {
  readonly config: BotConfig = defaultConfig;
  private readonly adapters = [new TwitchAdapter(this), new DiscordAdapter(this)];

  public readonly commandManager: CommandManager;
  public readonly logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.commandManager = new CommandManager(this);
    this.commandManager.load();
  }

  async setup() {
    this.logger.debug('Setting up bot...');
    for (const adapter of this.adapters) {
      await adapter.setup();
    }
  }

  async listen() {
    this.logger.debug('Loaded', this.config.env.NODE_ENV, 'config');
    for (const adapter of this.adapters) {
      await adapter.listen();
    }
  }
}

export default Bot;
