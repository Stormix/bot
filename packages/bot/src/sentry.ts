import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import '@sentry/tracing';
import env from './lib/env';
import { version } from './version';

export const initSentry = () => {
  Sentry.init({
    dsn: env.isDev ? '' : env.SENTRY_DSN,
    tracesSampleRate: env.isProd ? 1 : 0,
    release: version,
    profilesSampleRate: env.isProd ? 1.0 : 0,
    integrations: [new ProfilingIntegration()]
  });
};
