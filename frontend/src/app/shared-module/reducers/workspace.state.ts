// immutable
import { makeTypedFactory } from 'typed-immutable-record';

// our interfaces
import { IWorkspace, IWorkspaceRecord } from '../interfaces/workspace.interface';

export const workspaceFactory = makeTypedFactory<IWorkspace, IWorkspaceRecord>({
  // IMinimalWorkspace
  // -----------------
  // from server
  id: null,
  name: null,
  usedBy: null,

  // ------------------------

  // IWorkspace
  // ----------
  // from server
  buses: [],
  busesInProgress: [],

  // for UI
  searchPetals: '',
  fetchingWorkspace: false,
  importingBus: false,
  gettingBusConfig: false,

  selectedBusId: null,
  selectedContainerId: null,
  selectedComponentId: null,
  selectedServiceUnitId: null
});
