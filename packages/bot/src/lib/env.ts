import * as dotenv from 'dotenv';
import { bool, cleanEnv, port, str } from 'envalid';

dotenv.config();

const env = cleanEnv(process.env, {
  ENABLED: bool({ default: true }),
  NODE_ENV: str({ default: 'development', choices: ['development', 'test', 'production', 'staging'] }),
  SENTRY_DSN: str({ default: '' }),
  TWITCH_CLIENT_ID: str(),
  TWITCH_CLIENT_SECRET: str(),
  TWITCH_ACCESS_TOKEN: str(),
  TWITCH_REFRESH_TOKEN: str(),
  TWITCH_USERNAME: str({
    default: 'StormixBot'
  }),
  TWITCH_CHANNEL: str({
    default: 'stormix_co'
  }),
  DISCORD_TOKEN: str(),
  DISCORD_GUILD_ID: str(),
  DISCORD_OWNER_ID: str(),
  DATABASE_URL: str(),
  PORT: port({ default: 3000 }),
  REDIS_PORT: port({ default: 6379 }),
  REDIS_HOST: str({
    default: ''
  }),
  REDIS_PASSWORD: str({
    default: ''
  }),
  REDIS_USERNAME: str({
    default: ''
  }),
  HUGGING_MODEL: str({}),
  HUGGING_API_KEY: str({}),
  SPOTIFY_CLIENT_ID: str({}),
  SPOTIFY_CLIENT_SECRET: str({})
});

export type Env = typeof env;

export default env;
