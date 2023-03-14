export enum CommandSource {
  Twitch = 'twitch',
  Discord = 'discord'
}

export interface CommandContext {
  source: CommandSource;
}
