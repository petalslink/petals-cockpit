import { IEnvironment } from './environment.interface';
import { environment as prod } from './environment.prod';

export const environment: IEnvironment = {
  ...prod,
  strictCoherence: true,
  mock: {
    httpDelay: 0,
    sseDelay: 0,
    alreadyConnected: false,
  },
};
