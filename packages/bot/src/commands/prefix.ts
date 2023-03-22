import BuiltinCommand from '@/lib/command';
import type { CommandContext } from '@/types/command';

export default class PrefixCommand extends BuiltinCommand {
  name = 'prefix';

  async run(context: CommandContext) {
    return context.adapter.send(context, `My prefix is \`${context.adapter.bot.prefix}\``);
  }
}
