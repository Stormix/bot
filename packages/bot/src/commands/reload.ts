import type Bot from '@/lib/bot';
import BuiltinCommand from '@/lib/command';
import type { CommandContext } from '@/types/command';

export default class ReloadCommand extends BuiltinCommand {
  name = 'reload';

  constructor(bot: Bot) {
    super(bot, {
      ownerOnly: true
    });
  }

  async run(context: CommandContext) {
    await this.bot.reload();
    return context.adapter.send(context, 'Reloaded config');
  }
}
