import Twitch from '@/providers/twitch';
import { ServiceType } from '@prisma/client';
import type { Request, Response } from 'express';
import BaseController from './base';

export default class TwitchController extends BaseController {
  async authenticateUser(req: Request, res: Response) {
    try {
      const origin = req.headers.origin || 'http://localhost:3000/twitch';

      if (!req.query.code) {
        return this.invalid(res);
      }

      const { code } = req.query;
      const tokens = await Twitch.getInstance().getUserTokens(origin, code as string);

      if (!tokens) {
        return this.fail(res, new Error('Invalid code'));
      }

      await this.bot.credentials.setCredentials(ServiceType.TWITCH, tokens);

      return this.ok(res);
    } catch (error) {
      console.log('failed to authenticate user', error);
      return this.fail(res, error as Error);
    }
  }

  async authenticateBroadcaster(req: Request, res: Response) {
    try {
      const origin = req.headers.origin || 'http://localhost:3000/twitch';

      if (!req.query.code) {
        return this.invalid(res);
      }

      const { code } = req.query;
      const tokens = await Twitch.getInstance().getUserTokens(origin, code as string);

      if (!tokens) {
        return this.fail(res, new Error('Invalid code'));
      }

      await this.bot.credentials.setCredentials(ServiceType.TWITCH_BROADCASTER, tokens);

      return this.ok(res);
    } catch (error) {
      console.log('failed to authenticate user', error);
      return this.fail(res, error as Error);
    }
  }
}
