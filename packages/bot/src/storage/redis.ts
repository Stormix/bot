import type Bot from '@/lib/bot';
import { StorageTypes } from '@/types/storage';
import { createClient } from 'redis';
import Storage from '../lib/storage';

class RedisStorage extends Storage {
  client: ReturnType<typeof createClient>;

  constructor(bot: Bot) {
    super(StorageTypes.Redis, bot);

    this.client = createClient({
      url: `redis://${bot.config.env.REDIS_HOST}:${bot.config.env.REDIS_PORT}`,
      username: bot.config.env.REDIS_USERNAME,
      password: bot.config.env.REDIS_PASSWORD
    });
  }

  set(key: string, value: string) {
    return this.client.set(`${this.prefix}${key}`, value);
  }

  get(key: string) {
    return this.client.get(`${this.prefix}${key}`);
  }
}

export default RedisStorage;
