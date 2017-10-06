import { environment as dev } from './environment.dev';
import { IEnvironment } from './environment.interface';
import { environment as prod } from './environment.prod';

export const environment: IEnvironment = {
  ...dev,
  services: prod.services,
  mock: undefined,
};
