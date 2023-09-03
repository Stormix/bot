import type Activity from '@/lib/activity';
import { ActivityType } from '@/lib/activity';
import type Bot from '@/lib/bot';
import Skill from '@/lib/skill';
import Spotify from '@/providers/spotify';
import { Adapters, ServiceType } from '@prisma/client';
import * as Sentry from '@sentry/node';

export default class Music extends Skill {
  private readonly spotify: Spotify;
  constructor(bot: Bot) {
    super(bot, [ActivityType.Music]);
    this.spotify = Spotify.getInstance();
  }

  async handle(activity: Activity<ActivityType.Music>) {
    try {
      const { song, context } = activity.payload;
      const spotifyTokens = await this.bot.credentials.getCredentials(ServiceType.SPOTIFY);
      // Ensure spotify is auhtenticated
      if (!spotifyTokens) {
        this.logger.info(
          'Spotify is not authenticated, open the following url:',
          Spotify.login(`http://localhost:${this.bot.api.port}/spotify`)
        );
        await context.adapter.send(
          `Spotify is not authenticated, open the following url: ${Spotify.login(
            `http://localhost:${this.bot.api.port}/spotify`
          )}`,
          context
        );
        return;
      }

      this.logger.debug(`New music requet: ${song} from ${context.message.channel}`);

      // Currently only twitch is supported, but this should be abstracted
      if (context.adapter.name === Adapters.DISCORD) return;

      // Validate spotify link and ensure it's a link to a song
      const spotifyLinkRegex = /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;
      const match = spotifyLinkRegex.exec(song);

      if (!match) {
        await context.adapter.send(`Invalid link: ${song}, and I'm still taking your points.`, context);
        return;
      }

      const spotifyUri = `spotify:track:${match[1]}`;
      // TODO: check if song is already in queue

      // Fetch track info
      const trackInfo = await this.spotify.getTrackInfo(spotifyTokens, match[1]);

      if (!trackInfo) {
        await context.adapter.send(`Failed to get track info for ${song}, and I'm still taking your points.`, context);
        return;
      }

      // Add song to queue on spotify
      await this.spotify.addSongToQueue(spotifyTokens, spotifyUri);
      return context.adapter.send(`Added ${trackInfo.name} by ${trackInfo.artists?.[0].name} to queue`, context);
    } catch (error) {
      Sentry.captureException(error);
      this.logger.error('Failed to handle activity: ', error);
    }
  }
}
