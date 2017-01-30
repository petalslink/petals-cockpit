import { IServiceUnitRow, IServiceUnit } from './service-unit.interface';

interface IserviceUnitsCommon {
  selectedServiceUnitId: string;
}

export interface IserviceUnitsTable extends IserviceUnitsCommon {
  byId: { [key: string]: IServiceUnitRow };
  allIds: Array<string>;
}

export interface IserviceUnits extends IserviceUnitsCommon {
  list: Array<IServiceUnit>;
}
