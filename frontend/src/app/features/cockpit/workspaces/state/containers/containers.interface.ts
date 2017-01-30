import { IContainerRow, IContainer } from './container.interface';

export interface IContainersCommon {
  selectedContainerId: string;
}

export interface IContainersTable extends IContainersCommon {
  byId: { [key: string]: IContainerRow };
  allIds: Array<string>;
}

export interface IContainers extends IContainersCommon {
  list: Array<IContainer>;
}
