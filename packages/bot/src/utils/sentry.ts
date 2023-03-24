import type { Env } from '@/lib/env';
import { version } from '@/version';
import type * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { omit } from 'lodash';

export const generateSentryConfig = (env: Env, options?: Sentry.NodeOptions): Sentry.NodeOptions => {
  return {
    dsn: env.isDev ? '' : env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: version,
    tracesSampleRate: env.isProd ? 1.0 : 0,
    profilesSampleRate: env.isProd ? 1.0 : 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry types don't export Integration[]
    integrations: [new ProfilingIntegration(), ...(options?.integrations ?? ([] as any))],
    ...omit(options, 'integrations')
  };
};
