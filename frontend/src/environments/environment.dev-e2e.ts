import { environment as dev } from './environment.dev';
import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  ...dev,
  // TODO remove services.
  // This is a temporary fix to use 'ng serve -c dev-e2e' cmd and run the e2e tests.
  // See https://gitlab.com/linagora/petals-cockpit/merge_requests/545
  services: dev.services,
  mock: { httpDelay: 0, sseDelay: 0, alreadyConnected: false },
};
