import { ILogObj, Logger } from 'tslog';
import { Container } from 'typedi';

const logger = new Logger<ILogObj>();

Container.set('logger', logger);
