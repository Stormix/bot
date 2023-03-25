import { loadModulesInDirectory } from '@/utils/loaders';
import type Bot from './bot';
import type Logger from './logger';
import type Skill from './skill';

export default class Brain {
  private readonly logger: Logger;
  private readonly bot: Bot;

  private skills: Skill[] = []; // TODO: think this through

  constructor(bot: Bot) {
    this.bot = bot;
    this.logger = bot.logger.getSubLogger({ name: this.constructor.name });
  }

  async boot() {
    const skills = await loadModulesInDirectory<Skill>('skills');
    for (const Skill of skills) {
      this.skills.push(new Skill(this.bot));
    }
    this.logger.debug(`Loaded ${this.skills.length} skills.`);
  }
}
