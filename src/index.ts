import '@/lib/logger';
import 'reflect-metadata';
import { Container } from 'typedi';
import Bot from './bot';

const bot = Container.get(Bot);

bot.listen();
