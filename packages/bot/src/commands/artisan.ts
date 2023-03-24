import type Bot from '@/lib/bot';
import BuiltinCommand from '@/lib/command';
import type { CommandContext } from '@/types/command';
import * as Sentry from '@sentry/node';

export default class ArtisanCommand extends BuiltinCommand {
  name = 'artisan';

  constructor(bot: Bot) {
    super(bot, {
      aliases: ['config'],
      cooldown: 0,
      enabled: true,
      ownerOnly: true
    });
  }

  get artisan() {
    return this.bot.artisan;
  }

  async run(context: CommandContext, args: string[]) {
    this.logger.debug('Artisan command called');
    const [command, ...commandArgs] = args;
    if (!command) {
      return context.adapter.send(context, 'Please specify a command to run');
    }
    try {
      return this.artisan.run(command, commandArgs, context);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          command: `artisan ${command}`,
          commandArgs: commandArgs.join(' ')
        }
      });
      this.logger.error('Failed to run artisan command.', error);
      return context.adapter.send(
        context,
        `Failed to run artisan command. ${context.atOwner} check logs for more info.`
      );
    }
  }
}
