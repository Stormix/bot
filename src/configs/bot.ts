import env, { Env } from '../env';

export interface BotConfig {
  env: Env;
}

export const defaultConfig: BotConfig = {
  env
};
