import type Bot from '@/lib/bot';
import type Logger from '@/lib/logger';
import type { Response } from 'express';

export default abstract class BaseController {
  protected readonly logger: Logger;
  protected readonly bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
    this.logger = bot.logger.getSubLogger({ name: this.constructor.name });
  }

  public jsonResponse(res: Response, code: number, message: string) {
    return res.status(code).json({ message });
  }

  public ok<T>(res: Response, data?: T) {
    if (data) {
      res.type('application/json');
      return res.status(200).json(data);
    }
    return res.sendStatus(200);
  }

  public created<T>(res: Response, data?: T) {
    if (data) {
      res.type('application/json');
      return res.status(201).json(data);
    }
    return res.sendStatus(201);
  }

  public clientError(res: Response, message?: string) {
    return this.jsonResponse(res, 400, message || 'Unauthorized');
  }

  public unauthorized(res: Response, message?: string) {
    return this.jsonResponse(res, 401, message || 'Unauthorized');
  }

  public paymentRequired(res: Response, message?: string) {
    return this.jsonResponse(res, 402, message || 'Payment required');
  }

  public forbidden(res: Response, message?: string) {
    return this.jsonResponse(res, 403, message || 'Forbidden');
  }

  public notFound(res: Response, message?: string) {
    return this.jsonResponse(res, 404, message || 'Not found');
  }

  public conflict(res: Response, message?: string) {
    return this.jsonResponse(res, 409, message || 'Conflict');
  }

  public deprecated(res: Response, message?: string) {
    return this.jsonResponse(res, 410, message || 'This endpoint has been deprecated.');
  }

  public invalid(res: Response, message?: string) {
    return this.jsonResponse(res, 422, message || 'Missing required fields.');
  }

  public tooMany(res: Response, message?: string) {
    return this.jsonResponse(res, 429, message || 'Too many requests');
  }

  public todo(res: Response) {
    return this.jsonResponse(res, 400, 'TODO');
  }

  public thirdPartyError(res: Response) {
    return this.jsonResponse(res, 503, 'Failed to process due to 3rd party service.');
  }

  public fail(res: Response, error: Error) {
    this.logger.error(error.message, error);
    return res.status(500).json({
      message: error.toString()
    });
  }
}
