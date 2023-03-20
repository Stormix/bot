import type { BuiltinCommandOptions, CommandContext } from '@/types/command';
import type Bot from './bot';
import type Logger from './logger';

abstract class BuiltinCommand {
  protected logger: Logger;
  protected bot: Bot;
  protected options: BuiltinCommandOptions;

  abstract name: string;

  /**
   * Creates a new builtin command
   * @param bot - The bot instance
   * @param options - The options for the command (e.g. aliases, cooldown, etc.)
   */
  constructor(bot: Bot, options?: BuiltinCommandOptions) {
    this.bot = bot;
    this.logger = bot.logger.getSubLogger({ name: this.constructor.name });
    this.options = options || {
      enabled: true,
      aliases: [],
      cooldown: 0
    };
  }

  /**
   * Checks if the command is the command or an alias
   * @param command  The command to check
   * @returns
   */
  public isCommand(command: string): boolean {
    return this.name === command || this.options.aliases.includes(command);
  }

  /**
   * Core command logic to be implemented by the command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param args
   */
  abstract run(context: CommandContext, args: string[]): Promise<void>;
}

export default BuiltinCommand;
