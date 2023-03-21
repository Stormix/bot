import type { Router } from 'express';
import type BaseController from '../controllers/base';

interface Route {
  path?: string | string[];
  router: Router;
  controller: BaseController;
}

export default Route;
