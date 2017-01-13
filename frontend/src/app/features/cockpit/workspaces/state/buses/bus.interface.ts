import { IContainers } from './../containers/containers.interface';

export interface IBusCommon {
  // from server
  id: string;
  name: string;
  importError: string;

  // for UI
  isFolded: boolean;
  isDiscarding: boolean;
  isFetchingDetails: boolean;
  isBeingRemoved: boolean;
}

// used within table
export interface IBusRow extends IBusCommon {
  // from server
  containers: Array<string>;
}

// used in generated views
export interface IBus extends IBusCommon {
  containers: IContainers;
}
