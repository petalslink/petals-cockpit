import { IBusRow, IBus } from './bus.interface';

export interface IBusesCommon {
  selectedBusId: string;
  importingBus: boolean;
}

export interface IBusesTable extends IBusesCommon {
  byId: { [key: string]: IBusRow };
  allIds: Array<string>;
}

export interface IBuses extends IBusesCommon {
  list: Array<IBus>;
}
