import { version } from '@/version';
import type { Env } from '../lib/env';
import env from '../lib/env';

export interface BotConfig {
  env: Env;
  prefix: string;
  version: string;
  name: string;
}

export const defaultConfig: BotConfig = {
  env,
  prefix: '^',
  version,
  name: 'StormixBot'
};
