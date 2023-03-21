import type Bot from '@/lib/bot';
import type { Env } from '@/lib/env';
import type Logger from '@/lib/logger';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import compression from 'compression';
import cors from 'cors';
import type { Application, Response } from 'express';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import type { Server as HttpServer } from 'http';
import { createServer } from 'http';
import type Route from './routes/route';

export default class App {
  app: Application;
  port: string | number;
  logger: Logger;
  env: Env;
  bot: Bot;

  server: HttpServer;
  allowedOrigins: string[];

  constructor(bot: Bot, routes: Route[]) {
    this.bot = bot;
    this.logger = bot.logger.getSubLogger({ name: 'API' });
    this.app = express();
    this.port = bot.config.env.PORT;
    this.env = bot.config.env;
    this.server = createServer(this.app);

    // CORS config
    this.allowedOrigins = ['localhost'];

    if (!this.env.isDev) {
      (process.env.ALLOWED_ORIGINS?.split(',') ?? []).forEach((url) => {
        this.allowedOrigins.push(new URL(url)?.hostname);
        this.allowedOrigins.push(`www.${new URL(url)?.hostname}`);
      });
    }

    this.initializeMiddleware();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();

    this.initializeSentry();
  }

  public async listen() {
    return this.server.listen(this.port, () => {
      this.logger.info(`================== API =================`);
      this.logger.info(`Env: ${this.env.NODE_ENV}`);
      this.logger.info(`Port: ${this.port}`);
      this.logger.info(`Allowed origins: ${this.allowedOrigins}`);
      this.logger.info(`=========================================`);
    });
  }

  public async close() {
    this.logger.info('Received kill signal, shutting down gracefully...');
    this.server.close();
    process.exit(0);
  }
  private initializeCors() {
    if (this.env.isTest) {
      return;
    }
    const isOriginAllowed = (origin: string) => {
      return this.allowedOrigins.includes(new URL(origin)?.hostname) || this.allowedOrigins.includes(origin);
    };

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (!isOriginAllowed(origin)) {
            this.logger.warn(`CORS: An unknown client made a request from ${origin}`);
            return callback(null, false);
          }
          return callback(null, true);
        }
      })
    );
  }
  private initializeMiddleware() {
    this.initializeCors();

    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(
      express.json({
        limit: '50mb',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verify: (req: any, _, buf: unknown) => {
          req.rawBody = buf;
        }
      })
    );
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
  }

  private initializeRoutes(routes: Route[]) {
    this.app.get('/', (_, res: Response) => {
      return res.json({
        name: this.bot.config.name,
        version: this.bot.config.version
      });
    });
    routes.forEach((route) => {
      this.app.use(`/${route.path}`, route.router);
    });

    this.logger.info(`Loaded all ${routes.length} routes..`);
  }
  private initializeErrorHandling() {
    // Express missing routes handling
    this.app.use((_, res: Response) => {
      return res.status(404).end('404');
    });
    if (!this.env.isDev) {
      // The error handler must be before any other error middleware and after all controllers
      this.app.use(Sentry.Handlers.errorHandler());
    }
    // this.app.use(errorMiddleware);
  }

  private initializeSentry() {
    if (this.env.isDev) {
      return;
    }

    // Sentry error handling config
    Sentry.init({
      dsn: this.env.SENTRY_DSN,
      environment: this.env.NODE_ENV,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({
          app: this.app
        })
      ],
      tracesSampleRate: 1.0
    });

    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(Sentry.Handlers.tracingHandler());
  }
}
