import type TwitchAdapter from '@/adapters/twitch';
import type Activity from '@/lib/activity';
import { ActivityType } from '@/lib/activity';
import type Bot from '@/lib/bot';
import Skill from '@/lib/skill';
import Twitch from '@/providers/twitch';
import { ServiceType } from '@prisma/client';
import * as Sentry from '@sentry/node';

export default class Warden extends Skill {
  constructor(bot: Bot) {
    super(bot, [ActivityType.Votekick]);
  }

  async handle(activity: Activity<ActivityType.Votekick>) {
    try {
      const { username, context } = activity.payload;

      if (username.includes('StormixBot')) return;

      // Create a poll for votekick
      const result = await (context.adapter as TwitchAdapter).createPoll(
        `Should we kick ${username}?`,
        ['yes', 'no'],
        context
      );

      if (result === 'yes') {
        const broadcasterTokens = await this.bot.credentials.getCredentials(ServiceType.TWITCH_BROADCASTER);
        if (!broadcasterTokens) throw new Error('Missing broadcaster tokens');
        await Twitch.getInstance().timeoutUser(broadcasterTokens, username, 60 * 5);
        await (context.adapter as TwitchAdapter).send(`@${username} has been kicked!`, context);
      }
    } catch (error) {
      Sentry.captureException(error);
      this.logger.error('Failed to handle activity: ', error);
    }
  }
}
