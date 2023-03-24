import * as Sentry from '@sentry/node';

import '@sentry/tracing';
import env from './lib/env';
import { version } from './version';

export const initSentry = () => {
  Sentry.init({
    dsn: env.isDev ? '' : env.SENTRY_DSN,
    tracesSampleRate: env.isProd ? 0.5 : 0,
    release: version
  });
};
