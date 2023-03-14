import Bot from './lib/bot';
import container from './lib/container';

const bot = container.get(Bot);

bot.listen();
