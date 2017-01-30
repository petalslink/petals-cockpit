import { IBusesTable } from './buses.interface';

export function busesTableFactory(): IBusesTable {
  return {
    selectedBusId: '',
    byId: {},
    allIds: []
  };
}
