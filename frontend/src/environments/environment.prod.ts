
import { environment as dev } from './environment.dev';

export const environment = {
  ...dev,
  production: true,
  strictCoherence: false,
  debug: false,
  mock: undefined
};
