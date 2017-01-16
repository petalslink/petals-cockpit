import { IserviceUnits } from '../service-units/service-units.interface';

export enum EComponentState { Started, Stopped, Loaded, Unloaded, Shutdown }
export enum EComponentType { BC, SE }

export interface IComponentCommon {
  // from server
  id: string;
  name: string;
  state: EComponentState;
  type: EComponentType;

  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
}

export interface IComponentRow extends IComponentCommon {
  // from server
  serviceUnits: Array<string>;
}

export interface IComponent extends IComponentCommon {
  // from server
  serviceUnits: IserviceUnits;
}
