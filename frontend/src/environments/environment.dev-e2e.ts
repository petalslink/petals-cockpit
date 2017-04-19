
import { environment as dev } from './environment.dev';

export const environment = {
  ...dev,
  mock: {
    httpDelay: 0,
    sseDelay: 0,
    alreadyConnected: false
  }
};
