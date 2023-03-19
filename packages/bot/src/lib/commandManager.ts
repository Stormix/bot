import { CommandType } from '@prisma/client';
import { globSync } from 'glob';
import { omit } from 'lodash';
import type { CommandContext } from '../types/command';
import type Bot from './bot';
import type Command from './command';
import BotLanguage from './language';
import type Logger from './logger';

export default class CommandManager {
  private commands: Command[] = [];
  public readonly logger: Logger;
  private readonly bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
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

  async run<Context extends CommandContext>(keyword: string, args: string[], context: Context) {
    if (this.commands.length === 0) await this.load();

    this.logger.debug(
      `Evaluating command ${keyword} with args ${args.join(', ')}from`,
      omit(context, 'adapter', 'message')
    );

    // Check for built-in commands
    const commandInstance = this.get(keyword);
    if (commandInstance) {
      await commandInstance.run(context, args);
      return;
    }

    // Check for custom commands
    const command = await this.bot.prisma.command.findFirst({
      where: {
        name: keyword,
      },
    });

    if (command) {
      if (!command?.response) return context.adapter.send(context, `${context.atOwner} probably forgot to add a response to this command!`);
      if (!command.enabled) return context.adapter.send(context, `${context.atAuthor} this command is disabled!`);

      switch (command.type) {
        case CommandType.STATIC:
          return  context.adapter.send(context, command.response);
        case CommandType.DYNAMIC:
          const code = command.response;
          try {
            await BotLanguage.evaluate(code, context);
          } catch (error) {
            this.logger.error(`Error while evaluating command ${keyword} from ${context.atAuthor}!`, error);
            await context.adapter.send(context, `${context.atAuthor} could not evaluate this command! Ask ${context.atOwner} to check the logs!`);
          } finally {
            return;
          }
        default:
          return context.adapter.send(context, `${context.atOwner} this command has an invalid type!`);
      }
    }

    // Command not found
    return context.adapter.send(context, `${context.atAuthor} Command \`${this.bot.config.prefix}${keyword}\` not found!`);
  }
}
