import DiscordAdapter from '@/adapters/discord';
import TwitchAdapter from '@/adapters/twitch';
import type { BotConfig } from '@/config/bot';
import { defaultConfig } from '@/config/bot';
import { PrismaClient } from '@prisma/client';
import Artisan from './artisan';
import Logger from './logger';
import Processor from './processor';

class Bot {
  readonly config: BotConfig = defaultConfig;
  private readonly adapters = [new TwitchAdapter(this), new DiscordAdapter(this)];

  public readonly processor: Processor;
  public readonly logger: Logger;
  public readonly prisma: PrismaClient = new PrismaClient();
  public readonly artisan: Artisan;

  /**
   * Creates a new bot instance
   */
  constructor() {
    this.logger = new Logger();
    this.artisan = new Artisan(this);
    this.processor = new Processor(this);

    this.processor.load();
  }

  /**
   * Sets up the bot
   */
  async setup() {
    this.logger.debug('Setting up bot...');
    for (const adapter of this.adapters) {
      await adapter.setup();
    }
    this.logger.info('Connecting to database...');
    await this.prisma.$connect();
  }

  /**
   * Starts the bot
   */
  async listen() {
    this.logger.debug('Loaded', this.config.env.NODE_ENV, 'config');
    for (const adapter of this.adapters) {
      await adapter.listen();
    }
  }

  /**
   * Stops the bot
   */
  async stop() {
    this.logger.debug('Stopping bot...');

    this.logger.info('Disconnecting from adapters...');
    for (const adapter of this.adapters) {
      await adapter.stop();
    }

    this.logger.info('Disconnect from database...');
    await this.prisma.$disconnect();
  }
}

export default Bot;
