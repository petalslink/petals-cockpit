import { IBusesInProgressTable } from './buses-in-progress.interface';

export function busesInProgressTableFactory(): IBusesInProgressTable {
  return {
    selectedBusInProgressId: '',
    isImportingBus: false,

    byId: {},
    allIds: []
  };
}
