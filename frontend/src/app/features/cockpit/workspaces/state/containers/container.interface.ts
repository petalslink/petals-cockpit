import { IComponents } from '../components/components.interface';

export interface IContainerCommon {
  // from server
  id: string;
  name: string;
  ip: string;
  port: number;
  systemInfo: string;

  // for UI
  isFolded: boolean;
  isFetchingDetail: boolean;
}

export interface IContainerRow extends IContainerCommon {
  // from server
  components: Array<string>;
  // id of the containers available in the bus
  // only contains reachable containers but in order to
  // improve perfs, do not use an array (so we can avoid `find` later)
  // reachabilitiesId: { [key: string]: null };
}

export interface IContainer extends IContainerCommon {
  components: IComponents;
  // reachabilities: Array<???> // not made yet
}
