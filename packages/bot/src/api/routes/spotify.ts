import type Bot from '@/lib/bot';
import type { Request, Response } from 'express';
import { Router } from 'express';
import SpotifyController from '../controllers/spotify';
import type Route from './route';

class SpotifyRoutes implements Route {
  public path = 'spotify';

  public router = Router();

  public controller: SpotifyController;

  constructor(bot: Bot) {
    this.controller = new SpotifyController(bot);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/callback', (req: Request, res: Response) => this.controller.authenticateUser(req, res));
  }
}

export default SpotifyRoutes;
