import { glob } from 'glob';
import type Command from './command';
import type Logger from './logger';

export default class CommandManager {
  private commands: Command[] = [];

  constructor(public readonly logger: Logger) {
    this.logger.debug('CommandManager initialized');
  }

  register(command: Command) {
    this.commands.push(command);
  }

  get(name: string) {
    return this.commands.find((c) => c.name === name);
  }

  async load() {
    const commands = await glob(__dirname + '../commands/**/*.ts');
    for (const command of commands) {
      const { default: Command } = await import(command);
      this.register(new Command());
    }
  }
}
