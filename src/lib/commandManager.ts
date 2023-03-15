import { globSync } from 'glob';
import { omit } from 'lodash';
import type { CommandContext } from '../types/command';
import type Bot from './bot';
import type Command from './command';
import type Logger from './logger';

export default class CommandManager {
  private commands: Command[] = [];
  public readonly logger: Logger;

  constructor(bot: Bot) {
    this.logger = bot.logger.getSubLogger({ name: 'CommandManager' });
    this.logger.debug('CommandManager initialized');
  }

  register(command: Command) {
    this.commands.push(command);
  }

  get(name: string) {
    return this.commands.find((c) => c.name === name);
  }

  async load() {
    const commands = globSync('./src/commands/**/*.{ts,js}');
    for (const command of commands) {
      const { default: Command } = await import(command);
      this.register(new Command(this.logger));
    }

    this.logger.debug(`Loaded ${this.commands.length} commands!`);
  }

  async evalCommand<Context extends CommandContext>(command: string, args: string[], context: Context) {
    if (this.commands.length === 0) await this.load();
    this.logger.debug(
      `Evaluating command ${command} with args ${args.join(', ')}from`,
      omit(context, 'adapter', 'message')
    );

    const commandInstance = this.get(command);
    if (commandInstance) {
      await commandInstance.run(context, args);
      return;
    }

    return context.adapter.send(context, `${context.atAuthor} Command ${command} not found!`);
  }
}
