export enum EServiceUnitState { Started, Stopped, Unloaded, Shutdown }

export interface IServiceUnitCommon {
  // from server
  id: string;
  name: string;
  state: EServiceUnitState;

  // for UI
  isFolded: boolean;
  isUpdatingState: boolean;
}

export interface IServiceUnitRow extends IServiceUnitCommon { }

export interface IServiceUnit extends IServiceUnitCommon { }
