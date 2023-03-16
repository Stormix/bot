import type { CommandContext } from '@/types/command';
import type Logger from './logger';

abstract class Command {
  protected logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  abstract name: string;
  abstract run(context: CommandContext, args: string[]): Promise<void>;
}

export default Command;
