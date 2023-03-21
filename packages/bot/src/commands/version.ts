import type Bot from '@/lib/bot';
import BuiltinCommand from '@/lib/command';
import type { CommandContext } from '@/types/command';

export default class VersionCommand extends BuiltinCommand {
  name = 'version';

  constructor(bot: Bot) {
    super(bot, {
      aliases: ['v'],
      cooldown: 0,
      enabled: true
    });
  }

  async run(context: CommandContext) {
    return context.adapter.send(context, `I am currently running version ${this.bot.config.version} | `);
  }
}
