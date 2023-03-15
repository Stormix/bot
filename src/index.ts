import Bot from './lib/bot';

(async () => {
  const bot = new Bot();

  await bot.setup();
  await bot.listen();
})();
