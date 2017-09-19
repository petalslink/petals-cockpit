import { IEnvironment } from './environment.interface';
import { environment as prod } from './environment.prod';

export const environment: IEnvironment = {
  ...prod,
  hashLocationStrategy: true,
  debug: true,
  mock: {
    httpDelay: 500,
    sseDelay: 500,
    alreadyConnected: false,
  },
};
