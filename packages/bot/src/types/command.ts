import type CliAdapter from '@/adapters/cli';
import type { Command } from '@prisma/client';
import type { Message } from 'discord.js';
import type { PrivateMessage } from 'twitch-js';
import type DiscordAdapter from '../adapters/discord';
import type TwitchAdapter from '../adapters/twitch';

export class CliMessage {
  constructor(public message: string) {}
}

export interface CommandContext {
  atOwner: string;
  atAuthor: string;
  adapter: TwitchAdapter | DiscordAdapter | CliAdapter;
  message: Message | PrivateMessage | CliMessage;
}

export interface TwitchCommandContext extends CommandContext {
  message: PrivateMessage;
  adapter: TwitchAdapter;
}

export interface DiscordCommandContext extends CommandContext {
  adapter: DiscordAdapter;
  message: Message;
}

export interface CliCommandContext extends CommandContext {
  message: CliMessage;
  adapter: CliAdapter;
}

export type BuiltinCommandOptions = Partial<Omit<Command, 'id' | 'response' | 'type' | 'name'>>;
