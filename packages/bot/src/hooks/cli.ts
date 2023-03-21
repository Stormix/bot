import Hook from '@/lib/hook';
import art from 'ascii-art';

export default class CliHook extends Hook {
  public async onStart() {
    console.log((await art.font(this.bot.config.name, 'doom').toPromise()) + '\nVersion: ' + this.bot.config.version);
  }
  public async onReady() {
    // Do nothing
  }
  public async onStop() {
    // Do nothing
  }
}
