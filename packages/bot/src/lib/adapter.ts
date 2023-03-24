import type Bot from '@/lib/bot';
import type { Adapters } from '@prisma/client';
import type { CommandContext } from '../types/command';
import type Logger from './logger';

abstract class Adapter<Context extends CommandContext> {
  readonly bot: Bot;
  name: Adapters;
  logger: Logger;

  constructor(bot: Bot, name: Adapters) {
    this.bot = bot;
    this.name = name;
    this.logger = this.bot.logger.getSubLogger({ name: this.name });
  }

  abstract getClient(): unknown;
  abstract setup(): Promise<void>;
  abstract listen(): Promise<void>;
  abstract atAuthor(message: unknown): string;
  abstract createContext(message: unknown): Context;
  abstract send(context: Context, message: string): Promise<void>;
  abstract isOwner(message: unknown): boolean;
  abstract stop(): Promise<void>;
}

export default Adapter;
