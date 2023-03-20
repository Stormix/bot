import { ArtisanCommands } from '@/types/artisan';
import type { CommandContext } from '@/types/command';
import type Bot from './bot';
import { ValidationError } from './errors';

export default class Artisan {
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

      return context.adapter.send(context, `Running artisan command: ${command} ${args.join(' ')}`);
    } catch (error) {
      if (error instanceof ValidationError) {
        return context.adapter.send(context, error.message);
      }
      return context.adapter.send(
        context,
        `Failed to run artisan command. ${context.atOwner} check logs for more info.`
      );
    }
  }
}
