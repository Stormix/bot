import type { Env } from '../lib/env';
import env from '../lib/env';

export interface BotConfig {
  env: Env;
  prefix: string;
}

export const defaultConfig: BotConfig = {
  env,
  prefix: '^'
};
