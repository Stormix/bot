import { CommandContext } from '@/types/command';

abstract class Command {
  abstract name: string;
  abstract run(context: CommandContext): Promise<void>;
}

export default Command;
