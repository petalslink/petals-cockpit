import { IContainersTable } from './containers.interface';

export function containersTableFactory(): IContainersTable {
  return {
    selectedContainerId: '',
    byId: {},
    allIds: []
  };
}
