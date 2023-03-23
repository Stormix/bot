import App from '@/api/app';
import type { BotConfig } from '@/config/bot';
import { defaultConfig } from '@/config/bot';
import type Adapter from '@/lib/adapter';
import type { CommandContext } from '@/types/command';
import type { Constructor } from '@/types/generics';
import { loadModulesInDirectory } from '@/utils/loaders';
import { PrismaClient } from '@prisma/client';
import type { Dictionary } from 'lodash';
import { omit } from 'lodash';
import Artisan from './artisan';
import type Hook from './hook';
import Logger from './logger';
import Processor from './processor';
import type Storage from './storage';

class Bot {
  config: BotConfig = defaultConfig;
  adapters: Adapter<CommandContext>[] = [];
  hooks: Hook[] = [];
  storages: Storage[] = [];

  public readonly processor: Processor;
  public readonly logger: Logger;
  public readonly prisma: PrismaClient = new PrismaClient();
  public readonly artisan: Artisan;
  public readonly api: App;

  /**
   * Creates a new bot instance
   */
  constructor() {
    this.logger = new Logger().getSubLogger({ name: this.constructor.name });
    this.processor = new Processor(this);
    this.artisan = new Artisan(this);
    this.api = new App(this, []);
  }

  get prefix() {
    return this.config.prefix;
  }

  get storage() {
    const primaryStorage = this.storages.find((s) => s.primary);
    if (!primaryStorage) throw new Error('No primary storage found');
    return primaryStorage;
  }

  /**
   * Validates the config
   *
   * @param config The config to validate
   * @returns The validated config
   */
  static validateConfig(config: Record<string, string>) {
    const allowedKeys = Object.keys(defaultConfig).map((key) => key !== 'env' && key);
    const configKeys = Object.keys(config);
    const omittedKeys = configKeys.filter((key) => !allowedKeys.includes(key));

    return omit(config, omittedKeys);
  }

  /**
   * Sets up the bot
   */
  async setup() {
    this.logger.debug('Setting up bot...');

    await this.processor.load();
    await this.artisan.load();

    // Setup hooks
    await this.loadHooks();

    // Setup adapters
    await this.loadAdapters();

    // Setup db
    this.logger.info('Connecting to database...');
    await this.prisma.$connect();

    // Setup storage
    await this.loadStorage();

    // Load config
    await this.loadConfig();
  }

  async loadHooks() {
    // Load hooks
    this.logger.info('Loading hooks...');
    const hooks = await loadModulesInDirectory<Constructor<Hook>>('hooks');
    this.hooks = hooks.map((Hook) => new Hook(this));
  }

  async loadAdapters() {
    // Load adapters
    this.logger.info('Loading adapters...');
    const adapters = await loadModulesInDirectory<Constructor<Adapter<CommandContext>>>('adapters');
    this.adapters = adapters.map((Adapter) => new Adapter(this));

    // Setup adapters
    for (const adapter of this.adapters) {
      await adapter.setup();
    }
  }

  async loadStorage() {
    // Load storage
    this.logger.info('Loading storage...');
    const storages = await loadModulesInDirectory<Constructor<Storage>>('storage');
    this.storages = storages.map((Storage) => new Storage(this));

    // Setup adapters
    for (const storage of this.storages) {
      await storage.setup();
    }
  }

  /**
   * Loads the config from the database
   */
  async loadConfig() {
    // Overwrite config with db config
    this.logger.info('Loading config from database...');
    const overwrittenSettings = await this.prisma.setting.findMany();

    const overwrittenConfig = overwrittenSettings.reduce((acc, setting) => {
      acc[setting.name] = setting.value;
      return acc;
    }, {} as Dictionary<string>);

    this.config = {
      ...Bot.validateConfig({ ...omit(this.config, 'env'), ...overwrittenConfig }),
      env: this.config.env
    } as BotConfig;
  }

  async reload() {
    this.logger.info('Reloading bot...');
    await this.loadHooks();
    await this.loadAdapters();
    await this.loadConfig();
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
      await hook.onReady();
    }

    await this.api.listen();
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
