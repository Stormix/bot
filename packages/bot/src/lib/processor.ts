import type { Constructor } from '@/types/generics';
import { loadModulesInDirectory } from '@/utils/loaders';
import { CommandType } from '@prisma/client';
import { omit } from 'lodash';
import type { CommandContext } from '../types/command';
import type Bot from './bot';
import type BuiltinCommand from './command';
import BotLanguage from './language';
import type Logger from './logger';

export default class Processor {
  private readonly logger: Logger;
  private readonly bot: Bot;
  private commands: BuiltinCommand[] = [];

  constructor(bot: Bot) {
    this.bot = bot;
    this.logger = bot.logger.getSubLogger({ name: 'CommandManager' });
    this.logger.debug('CommandManager initialized');
  }

  register(command: BuiltinCommand) {
    this.commands.push(command);
  }

  get(keyword: string) {
    return this.commands.find((c) => c.isCommand(keyword));
  }

  async load() {
    const commands = await loadModulesInDirectory<Constructor<BuiltinCommand>>('commands');
    for (const Command of commands) {
      this.register(new Command(this.bot));
    }
    this.logger.debug(`Loaded ${this.commands.length} bot commands.`);
  }

  async run<Context extends CommandContext>(keyword: string, args: string[], context: Context) {
    try {
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
          name: keyword
        }
      });

      if (!command) {
        // Command not found
        return context.adapter.send(
          context,
          `${context.atAuthor} Command \`${this.bot.config.prefix}${keyword}\` not found!`
        );
      }

      if (!command?.response)
        return context.adapter.send(context, `${context.atOwner} probably forgot to add a response to this command!`);
      if (!command.enabled) return context.adapter.send(context, `${context.atAuthor} this command is disabled!`);

      if (command.ownerOnly && !context.adapter.isOwner(context.message)) {
        return context.adapter.send(
          context,
          `${context.atAuthor} this command can only be used by ${context.atOwner}! Do it one more time and I'll ban you!`
        );
      }

      switch (command.type) {
        case CommandType.STATIC:
          return context.adapter.send(context, command.response);
        case CommandType.DYNAMIC:
          const code = command.response;
          try {
            await BotLanguage.evaluate(code, context);
          } catch (error) {
            this.logger.error(`Error while evaluating command ${keyword} from ${context.atAuthor}!`, error);
            await context.adapter.send(
              context,
              `${context.atAuthor} could not evaluate this command! Ask ${context.atOwner} to check the logs!`
            );
          } finally {
            return;
          }
        default:
          return context.adapter.send(context, `${context.atOwner} this command has an invalid type!`);
      }
    } catch (error) {
      this.logger.error(`Error while running command ${keyword} from ${context.atAuthor}!`);
      this.logger.error(error);
      await context.adapter.send(
        context,
        `${context.atAuthor} could not run this command! Ask ${context.atOwner} to check the logs!`
      );
    }
  }
}
