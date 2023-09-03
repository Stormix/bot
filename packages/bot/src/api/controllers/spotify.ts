import Spotify from '@/providers/spotify';
import { ServiceType } from '@prisma/client';
import type { Request, Response } from 'express';
import BaseController from './base';

export default class SpotifyController extends BaseController {
  async authenticateUser(req: Request, res: Response) {
    try {
      const origin = req.headers.origin || 'http://localhost:3000/spotify';

      if (!req.query.code) {
        return this.invalid(res);
      }

      const { code } = req.query;
      const tokens = await Spotify.getInstance().getUserTokens(origin, code as string);

      if (!tokens) {
        return this.fail(res, new Error('Invalid code'));
      }

      await this.bot.credentials.setCredentials(ServiceType.SPOTIFY, tokens);

      const spotifyUser = await Spotify.getInstance().getUserInfo(tokens);

      if (!spotifyUser) {
        return this.fail(res, new Error('Invalid tokens'));
      }

      return this.ok(res, { spotifyUser });
    } catch (error) {
      console.log('failed to authenticate user', error);
      return this.fail(res, error as Error);
    }
  }
}
