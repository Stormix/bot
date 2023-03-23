import type Bot from '@/lib/bot';
import Logger from '@/lib/logger';
import { StorageTypes } from '@/types/storage';
import { createClient } from 'redis';
import Storage from '../lib/storage';

class RedisStorage extends Storage {
  primary = true;
  client: ReturnType<typeof createClient>;
  logger: Logger;

  constructor(bot: Bot) {
    super(StorageTypes.Redis, bot);

    this.client = createClient({
      url: `redis://${bot.config.env.REDIS_HOST}:${bot.config.env.REDIS_PORT}`,
      username: bot.config.env.REDIS_USERNAME,
      password: bot.config.env.REDIS_PASSWORD
    });

    this.logger = new Logger({ name: 'RedisStorage' });
  }

  async setup() {
    await this.client.connect();
  }

  async set(key: string, value: string, expiry?: number) {
    try {
      await this.client.set(`${this.prefix}${key}`, value, {
        EX: expiry ?? 0
      });
    } catch (error) {
      this.logger.error('Failed to set key', error);
    }
  }

  async get(key: string) {
    try {
      return this.client.get(`${this.prefix}${key}`);
    } catch (error) {
      this.logger.error('Failed to get key', error);
      return null;
    }
  }
}

export default RedisStorage;
