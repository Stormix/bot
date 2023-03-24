import type { Constructor } from '@/types/generics';
import { checkCommandCooldown, checkCommandFlags } from '@/utils/commands';
import { loadModulesInDirectory } from '@/utils/loaders';
import { CommandType } from '@prisma/client';
import * as Sentry from '@sentry/node';
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
    this.logger = bot.logger.getSubLogger({ name: this.constructor.name });
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
        `Evaluating command ${keyword} with args ${args.join(', ')} from ${context.atAuthor} in ${context.adapter.name}`
      );

      // Check for built-in commands
      const commandInstance = this.get(keyword);

      if (commandInstance) {
        let error = checkCommandFlags(commandInstance, context);
        if (error) return context.adapter.send(context, error);
        error = await checkCommandCooldown(commandInstance, context);
        if (error) return context.adapter.send(context, error);
        return commandInstance.run(context, args);
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

      if (!command?.response) {
        return context.adapter.send(context, `${context.atOwner} probably forgot to add a response to this command!`);
      }

      let error = checkCommandFlags(command, context);
      if (error) return context.adapter.send(context, error);
      // Hash command and check for cooldown
      error = await checkCommandCooldown(command, context);
      if (error) return context.adapter.send(context, error);

      switch (command.type) {
        case CommandType.STATIC:
          return context.adapter.send(context, command.response);
        case CommandType.DYNAMIC:
          const code = command.response;
          try {
            await BotLanguage.evaluate(code, context);
          } catch (error) {
            Sentry.captureException(error, {
              tags: {
                command: keyword
              }
            });
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
      Sentry.captureException(error, {
        tags: {
          command: keyword
        }
      });
      this.logger.error(`Error while running command ${keyword} from ${context.atAuthor}!`);
      this.logger.error(error);
      await context.adapter.send(
        context,
        `${context.atAuthor} could not run this command! Ask ${context.atOwner} to check the logs!`
      );
    }
  }
}
