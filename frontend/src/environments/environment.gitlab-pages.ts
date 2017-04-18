
import { environment as prod } from './environment.prod';

export const environment = {
  ...prod,
  hashLocationStrategy: true,
  debug: true,
  mock: {
    httpDelay: 500,
    sseDelay: 500,
    alreadyConnected: false
  }
};
