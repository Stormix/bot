import type { Message } from 'discord.js';
import type { PrivateMessage } from 'twitch-js';
import type DiscordAdapter from '../adapters/discord';
import type TwitchAdapter from '../adapters/twitch';

export enum CommandSource {
  Twitch = 'twitch',
  Discord = 'discord'
}

export interface CommandContext {
  source: CommandSource;
  atAuthor: string;
  adapter: TwitchAdapter | DiscordAdapter;
  message: Message | PrivateMessage;
}

export interface TwitchCommandContext extends CommandContext {
  message: PrivateMessage;
  adapter: TwitchAdapter;
}

export interface DiscordCommandContext extends CommandContext {
  adapter: DiscordAdapter;
  message: Message;
}