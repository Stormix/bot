import * as Sentry from '@sentry/node';
import { onShutdown } from 'node-graceful-shutdown';
import Bot from './lib/bot';
import env from './lib/env';
import { generateSentryConfig } from './utils/sentry';

Sentry.init(generateSentryConfig(env));

const bot = env.ENABLED ? new Bot() : null;

const run = async () => {
  if (!bot) console.log('Bot is disabled');
  await bot?.setup();
  await bot?.listen();
};

onShutdown(async () => {
  await bot?.stop();
});

run().catch(async (err) => {
  console.error('Failed to start bot', err);
  Sentry.captureException(err);
  process.exit(1);
});
