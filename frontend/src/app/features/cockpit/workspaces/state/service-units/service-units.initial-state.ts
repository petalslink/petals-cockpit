import { IserviceUnitsTable } from './service-units.interface';

export function serviceUnitsTableFactory(): IserviceUnitsTable {
  return {
    selectedServiceUnitId: '',
    byId: {},
    allIds: []
  };
}
