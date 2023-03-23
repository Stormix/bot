import type Bot from '@/lib/bot';
import { StorageTypes } from '@/types/storage';
import Storage from '../lib/storage';

export default class MemoryStorage extends Storage {
  primary = false;
  private _data: Record<string, string> = {};

  constructor(bot: Bot) {
    super(StorageTypes.Memory, bot);
  }

  async setup() {
    return;
  }

  async set(key: string, value: string) {
    this._data[`${this.prefix}${key}`] = value;
  }

  get(key: string) {
    return Promise.resolve(this._data?.[`${this.prefix}${key}`] ?? null);
  }
}
