import { IBusInProgress, IBusInProgressRow } from './bus-in-progress.interface';

export interface IBusesInProgressCommon {
  selectedBusInProgressId: string;
  importingBus: boolean;
}

export interface IBusesInProgressTable extends IBusesInProgressCommon {
  byId: { [key: string]: IBusInProgressRow };
  allIds: Array<string>;
}

export interface IBusesInProgress extends IBusesInProgressCommon {
  list: Array<IBusInProgress>;
}
