import env, { Env } from '../lib/env';

export interface BotConfig {
  env: Env;
}

export const defaultConfig: BotConfig = {
  env
};
