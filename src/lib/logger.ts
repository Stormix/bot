import type { ILogObj } from 'tslog';
import { Logger as TsLogger } from 'tslog';

class Logger extends TsLogger<ILogObj> {
  constructor() {
    super({
      name: 'Bot',
      prettyLogTemplate: '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}  {{logLevelName}}  [{{name}}]  '
    });
  }
}

export default Logger;
