import type Bot from '@/lib/bot';
import type { CommandContext } from '../types/command';

abstract class Adapter<Context extends CommandContext> {
  protected bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  abstract setup(): Promise<void>;
  abstract listen(): Promise<void>;
  abstract atAuthor(message: unknown): string;
  abstract createContext(message: unknown): Context;
  abstract send(context: Context, message: string): Promise<void>;
  abstract stop(): Promise<void>;
}

export default Adapter;
