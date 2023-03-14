import Bot from '@/bot';

abstract class Adapter {
  protected bot: Bot;
  constructor(bot: Bot) {
    this.bot = bot;
  }
  abstract setup(): Promise<void>;
  abstract listen(): Promise<void>;
}

export default Adapter;
