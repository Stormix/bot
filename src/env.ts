import * as dotenv from 'dotenv';
import { cleanEnv, str } from 'envalid';

dotenv.config();

const env = cleanEnv(process.env, {
  NODE_ENV: str({ default: 'development' }),
  TWITCH_CLIENT_ID: str(),
  TWITCH_ACCESS_TOKEN: str(),
  TWITCH_REFRESH_TOKEN: str(),
  TWITCH_USERNAME: str({
    default: 'Stormix_co'
  }),
  DISCORD_TOKEN: str(),
  DISCORD_GUILD_ID: str(),
  DISCORD_OWNER_ID: str()
});

export type Env = typeof env;

export default env;
