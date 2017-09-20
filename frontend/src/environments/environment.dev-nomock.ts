import { environment as dev } from './environment.dev';
import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  ...dev,
  mock: undefined,
};
