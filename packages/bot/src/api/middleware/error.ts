import env from '@/lib/env';
import Logger from '@/lib/logger';
import type { NextFunction, Request, Response } from 'express';
class HttpException extends Error {
  public status: number;

  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message = `Something went wrong, error code: ${(res as any)?.sentry ?? 'NOT_PROVIDED'}`;
    const logger = new Logger({ name: 'ErrorMiddleware' });
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);

    if (env.isDev) {
      console.error('Error details: ', error);
    }

    res.status(status).json({ message });
  } catch (err) {
    next(err);
  }
};

export default errorMiddleware;
