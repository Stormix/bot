import type { ILogObj } from 'tslog';
import { Logger as TsLogger } from 'tslog';

class Logger extends TsLogger<ILogObj> {
  constructor() {
    super({ name: 'Bot' });
  }
}

export default Logger;
