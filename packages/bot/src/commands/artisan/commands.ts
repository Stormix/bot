import BuiltinCommand from '@/lib/command';
import { ArtisanCommands } from '@/types/artisan';
import type { CommandContext } from '@/types/command';

export default class CommandsCommand extends BuiltinCommand {
  name = ArtisanCommands.Commands;

  async run(context: CommandContext, args: string[]): Promise<void> {
    switch (args[0]) {
      case 'list':
        return this.list(context);
      case 'enable':
        return this.toggle(context, args[1], true);
      case 'disable':
        return this.toggle(context, args[1], false);
      case 'add':
        return this.add(context, args);
      case 'remove':
        return this.remove(context, args[1]);
      case 'edit':
        return this.edit(context, args);
      case 'help':
      default:
        return this.help(context);
    }
  }
  /**
   * Lists all commands
   * @param context The context of the command (e.g. twitch or discord context)
   */
  async list(context: CommandContext): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Enables/Disables a command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param command The command to enable/disable
   * @param value Whether to enable or disable the command
   */
  async toggle(context: CommandContext, command: string, value: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Adds a command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param arg1
   */
  async add(context: CommandContext, args: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Removes a command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param command  The command to remove
   */
  async remove(context: CommandContext, command: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Edits a command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param arg1
   */
  async edit(context: CommandContext, args: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Displays help for the command
   * @param context The context of the command (e.g. twitch or discord context)
   */
  async help(context: CommandContext): Promise<void> {
    return context.adapter.send(
      context,
      `Usage: ${context.atAuthor} ${this.name} <list|enable|disable|add|remove|edit|help>`
    );
  }
}
