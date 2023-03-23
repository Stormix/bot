import type Bot from '@/lib/bot';
import type { StorageTypes } from '@/types/storage';

export default abstract class Storage {
  prefix: string;

  constructor(public type: StorageTypes, readonly bot: Bot) {
    this.prefix = `bot:${this.bot.config.name}:`;
  }

  abstract set(key: string, value: string): void;
  abstract get(key: string): Promise<string | null>;
}
