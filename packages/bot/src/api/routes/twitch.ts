import type Bot from '@/lib/bot';
import type { Request, Response } from 'express';
import { Router } from 'express';
import TwitchController from '../controllers/twitch';
import type Route from './route';

class TwitchRoutes implements Route {
  public path = 'twitch';

  public router = Router();

  public controller: TwitchController;

  constructor(bot: Bot) {
    this.controller = new TwitchController(bot);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/bot_callback', (req: Request, res: Response) => this.controller.authenticateUser(req, res));
    this.router.get('/broadcaster_callback', (req: Request, res: Response) =>
      this.controller.authenticateBroadcaster(req, res)
    );
  }
}

export default TwitchRoutes;
