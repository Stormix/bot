import { globSync } from 'glob';

export const loadModulesInDirectory = async <T>(directory: string) => {
  const commands = globSync(`${directory}/*.{ts,js}`);
  return Promise.all(
    commands.map(async (command) => {
      const { default: Command } = await import(command);
      return Command as T;
    })
  );
};
