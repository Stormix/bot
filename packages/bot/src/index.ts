import { onShutdown } from "node-graceful-shutdown";
import Bot from './lib/bot';

const bot = new Bot();

const run = async () => {
  await bot.setup();
  await bot.listen();
};

onShutdown(async () => {
  await bot.stop();
});

run()
  .catch(async (err) => {
    console.error('Failed to start bot', err)
    process.exit(1);
  });