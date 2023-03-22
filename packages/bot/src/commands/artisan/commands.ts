import BuiltinCommand from '@/lib/command';
import { ArtisanCommands } from '@/types/artisan';
import type { CommandContext } from '@/types/command';
import { formatCommand } from '@/utils/format';
import { CommandType } from '@prisma/client';

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
      case 'delete':
      case 'remove':
        return this.remove(context, args[1]);
      case 'edit':
        return this.edit(context, args);
      case 'help':
      default:
        return this.help(context, args[1]);
    }
  }
  /**
   * Lists all commands
   * @param context The context of the command (e.g. twitch or discord context)
   */
  async list(context: CommandContext): Promise<void> {
    // Get all commands
    const commands = await this.bot.prisma.command.findMany();

    // Format commands
    const formattedCommands = commands
      .map((command) => {
        return `${formatCommand(command.name, this.bot)}: ${command.response} (${
          command.enabled ? 'enabled' : 'disabled'
        })`;
      })
      .join('\n');

    return context.adapter.send(context, formattedCommands);
  }

  /**
   * Enables/Disables a command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param command The command to enable/disable
   * @param value Whether to enable or disable the command
   */
  async toggle(context: CommandContext, command: string, value: boolean): Promise<void> {
    // Check if command exists
    const existingCommand = await this.bot.prisma.command.findFirst({
      where: {
        name: command
      }
    });

    if (!existingCommand) {
      return context.adapter.send(
        context,
        `Command ${formatCommand(command, this.bot)} does not exist. Use ${formatCommand(
          'artisan commands add',
          this.bot
        )} to add it.`
      );
    }

    // Update command
    await this.bot.prisma.command.update({
      where: {
        id: existingCommand.id
      },
      data: {
        enabled: value
      }
    });

    return context.adapter.send(
      context,
      `Command ${formatCommand(command, this.bot)} has been ${value ? 'enabled' : 'disabled'}`
    );
  }

  /**
   * Adds a command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param - args The arguments of the command (e.g. commands add <command> <response> <cooldown>)
   */
  async add(context: CommandContext, args: string[]): Promise<void> {
    if (args.length < 3) return this.help(context);

    const command = args[1];
    const response = args[2];
    const isCode = response.startsWith('```') && response.endsWith('```');
    const cooldown = args[3] ? parseInt(args[3]) : 0;

    // Check if command already exists
    const existingCommand = await this.bot.prisma.command.findFirst({
      where: {
        name: command
      }
    });

    if (existingCommand) {
      return context.adapter.send(
        context,
        `Command ${formatCommand(command, this.bot)} already exists. Use ${formatCommand(
          'artisan commands edit',
          this.bot
        )} to edit it.`
      );
    }

    // Create command
    await this.bot.prisma.command.create({
      data: {
        response: response,
        name: command,
        type: isCode ? CommandType.DYNAMIC : CommandType.STATIC,
        enabled: true,
        cooldown
      }
    });
    return context.adapter.send(context, `Added command ${formatCommand(command, this.bot)}`);
  }

  /**
   * Removes a command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param command  The command to remove
   */
  async remove(context: CommandContext, command: string): Promise<void> {
    if (!command) return this.help(context);

    // Check if command exists
    const existingCommand = await this.bot.prisma.command.findFirst({
      where: {
        name: command
      }
    });

    if (!existingCommand) {
      return context.adapter.send(
        context,
        `Command ${formatCommand(command, this.bot)} does not exist. Use ${formatCommand(
          'list',
          this.bot
        )} to list all commands.`
      );
    }

    // Delete command
    await this.bot.prisma.command.delete({
      where: {
        id: existingCommand.id
      }
    });

    return context.adapter.send(context, `Removed command ${formatCommand(command, this.bot)}`);
  }

  /**
   * Edits a command
   * @param context The context of the command (e.g. twitch or discord context)
   * @param arg1
   */
  async edit(context: CommandContext, args: string[]): Promise<void> {
    if (args.length < 3) return this.help(context);
    if (args[3]) context.adapter.send(context, 'Cooldown cannot be edited, will be ignored.');

    const command = args[1];
    const response = args[2];
    const isCode = response.startsWith('```') && response.endsWith('```');

    // Check if command exists
    const existingCommand = await this.bot.prisma.command.findFirst({
      where: {
        name: command
      }
    });

    if (!existingCommand) {
      return context.adapter.send(
        context,
        `Command ${formatCommand(command, this.bot)} does not exist. Use ${formatCommand(
          'artisan commands add',
          this.bot
        )} to add it.`
      );
    }

    // Update command
    await this.bot.prisma.command.update({
      where: {
        id: existingCommand.id
      },
      data: {
        response: response,
        type: isCode ? CommandType.DYNAMIC : CommandType.STATIC
      }
    });

    return context.adapter.send(context, `Updated command ${formatCommand(command, this.bot)}`);
  }

  /**
   * Displays help for the command
   * @param context The context of the command (e.g. twitch or discord context)
   */
  async help(context: CommandContext, command?: string): Promise<void> {
    switch (command) {
      case 'add':
        return context.adapter.send(
          context,
          `Usage: ${context.atAuthor} -> ${this.name} add <command> <response> <cooldown> <enabled>`
        );
      case 'edit':
        return context.adapter.send(context, `Usage: ${context.atAuthor} -> ${this.name} edit <command> <response>`);
      default:
        return context.adapter.send(
          context,
          `Usage: ${context.atAuthor} -> ${this.name} <list|enable|disable|add|remove|edit|help>`
        );
    }
  }
}
