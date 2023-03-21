import * as Sentry from '@sentry/node';

// Importing @sentry/tracing patches the global hub for tracing to work.
import '@sentry/tracing';
import env from './lib/env';

export const initSentry = () => {
  Sentry.init({
    dsn: env.isDev ? '' : env.SENTRY_DSN,
    tracesSampleRate: env.isProd ? 0.2 : 0
  });
};
