import type Bot from '@/lib/bot';
import type { CliCommandContext } from '@/types/command';
import { CliMessage } from '@/types/command';
import { Adapters } from '@prisma/client';
import Readline from 'readline';
import Adapter from '../lib/adapter';

export default class CliAdapter extends Adapter<CliCommandContext> {
  client: Readline.Interface | null = null;

  constructor(bot: Bot) {
    super(bot, Adapters.CLI, { allowedEnvironments: ['development'] });
  }

  atAuthor() {
    return `System`;
  }

  isOwner() {
    return true;
  }

  createContext(message: CliMessage): CliCommandContext {
    return {
      atAuthor: this.atAuthor(),
      atOwner: `System`,
      message,
      adapter: this
    };
  }

  getClient() {
    return null;
  }

  async setup() {
    this.client = Readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.logger.info('CLI adapter is ready!');
  }

  async listen() {
    if (!this.client) throw new Error('CLI client is not initialized!');

    this.client?.on('line', async (line) => {
      const context = this.createContext(new CliMessage(line));
      const args = line.trim().split(/ +/);
      const command = args.shift()?.toLowerCase();

      if (!command) return;

      await this.bot.processor.run(command, args, context);
    });
  }

  async send(context: unknown, message: string): Promise<void> {
    console.log(message);
  }

  async stop() {
    if (!this.client) throw new Error('CLI client is not initialized!');
    this.client?.close();
  }
}
