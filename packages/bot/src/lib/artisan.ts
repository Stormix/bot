import { ArtisanCommands } from '@/types/artisan';
import type { CommandContext } from '@/types/command';
import type { Constructor } from '@/types/generics';
import { loadModulesInDirectory } from '@/utils/loaders';
import type Bot from './bot';
import type BuiltinCommand from './command';
import { ValidationError } from './errors';

export default class Artisan {
  private readonly logger = this.bot.logger.getSubLogger({ name: this.constructor.name });
  private commands: BuiltinCommand[] = [];

  /**
   * The artisan class - a utility class to control/configure the bot
   * @param bot The bot instance
   */
  constructor(private readonly bot: Bot) {}

  /**
   * Validates the artisan command
   *
   * @param command The artisan command to run
   * @param args The arguments to pass to the artisan command
   * @param context The context of the command (e.g. twitch or discord context)
   */
  async validate(command: string, args: string[], context: CommandContext) {
    if (!Object.values(ArtisanCommands).includes(command as ArtisanCommands))
      throw new ValidationError('Unknown artisan command');
  }

  /**
   * Loads the artisan commands
   */
  async load() {
    // Load artisan commands
    const commands = await loadModulesInDirectory<Constructor<BuiltinCommand>>('commands/artisan');

    // Register artisan commands
    commands.forEach((Command) => {
      this.commands.push(new Command(this.bot));
    });

    this.logger.info(`Loaded ${this.commands.length} artisan commands.`);
  }
  /**
   * Runs the artisan command
   *
   * @param command  The artisan command to run
   * @param args  The arguments to pass to the artisan command
   * @param context  The context of the command (e.g. twitch or discord context)
   * @returns
   */
  async run(command: string, args: string[], context: CommandContext): Promise<void> {
    try {
      await this.validate(command, args, context);

      const artisanCommand = this.commands.find((c) => c.isCommand(command));
      if (!artisanCommand) throw new ValidationError('Unknown artisan command');

      return artisanCommand.run(context, args);
    } catch (error) {
      if (error instanceof ValidationError) {
        return context.adapter.send(context, error.message);
      }
      this.logger.error('Failed to run artisan command. ', error);
      return context.adapter.send(
        context,
        `Failed to run artisan command. ${context.atOwner} check logs for more info.`
      );
    }
  }
}
