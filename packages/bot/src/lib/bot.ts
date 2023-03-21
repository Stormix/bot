import type { BotConfig } from '@/config/bot';
import { defaultConfig } from '@/config/bot';
import type Adapter from '@/lib/adapter';
import type { CommandContext } from '@/types/command';
import type { Constructor } from '@/types/generics';
import { loadModulesInDirectory } from '@/utils/loaders';
import { PrismaClient } from '@prisma/client';
import Artisan from './artisan';
import type Hook from './hook';
import Logger from './logger';
import Processor from './processor';

class Bot {
  readonly config: BotConfig = defaultConfig;
  readonly adapters: Adapter<CommandContext>[] = [];
  private readonly hooks: Hook[] = [];

  public readonly processor: Processor;
  public readonly logger: Logger;
  public readonly prisma: PrismaClient = new PrismaClient();
  public readonly artisan: Artisan;

  /**
   * Creates a new bot instance
   */
  constructor() {
    this.logger = new Logger();
    this.processor = new Processor(this);
    this.processor.load();
    this.artisan = new Artisan(this);
    this.artisan.load();
  }

  /**
   * Sets up the bot
   */
  async setup() {
    this.logger.debug('Setting up bot...');

    // Load adapters
    this.logger.info('Loading adapters...');
    const adapters = await loadModulesInDirectory<Constructor<Adapter<CommandContext>>>('adapters');
    for (const Adapter of adapters) {
      this.adapters.push(new Adapter(this));
    }

    // Load hooks
    this.logger.info('Loading hooks...');
    const hooks = await loadModulesInDirectory<Constructor<Hook>>('hooks');
    for (const Hook of hooks) {
      this.hooks.push(new Hook(this));
    }

    // Setup adapters
    for (const adapter of this.adapters) {
      await adapter.setup();
    }

    // Setup db
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
    for (const hook of this.hooks) {
      await hook.onStart();
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

    for (const hook of this.hooks) {
      await hook.onStop();
    }

    this.logger.info('Disconnect from database...');
    await this.prisma.$disconnect();
  }
}

export default Bot;
