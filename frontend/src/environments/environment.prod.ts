
import { environment as dev } from './environment';

export const environment = {
  ...dev,
  production: true,
  strictCoherence: false,
  debug: false,
  mock: false
};
