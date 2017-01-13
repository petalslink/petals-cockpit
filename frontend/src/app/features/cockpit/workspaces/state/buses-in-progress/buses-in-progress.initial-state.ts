import { IBusesInProgressTable } from './buses-in-progress.interface';

export function busesInProgressTableFactory(): IBusesInProgressTable {
  return {
    selectedBusInProgressId: '',
    // TODO : As we can have multiple import at the same time,
    // this might not be there
    importingBus: false,

    byId: {},
    allIds: []
  };
}
