import type Bot from './bot';
import type Logger from './logger';

/**
 * A hook allows you to run code when the bot starts or stops.
 * @abstract
 */
export default abstract class Hook {
  readonly logger: Logger;
  constructor(protected bot: Bot) {
    this.logger = bot.logger.getSubLogger({ name: this.constructor.name });
  }

  public abstract onStart(): Promise<void>;
  public abstract onStop(): Promise<void>;
}
