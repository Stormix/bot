import 'reflect-metadata';

import { ContainerBuilder } from 'diod';

import Logger from './logger';
import CommandManager from './commandManager';
import Bot from './bot';

const builder = new ContainerBuilder();

builder.registerAndUse(Logger);
builder.registerAndUse(CommandManager);
builder.registerAndUse(Bot);

const container = builder.build();

export default container;
