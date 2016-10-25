import { List, Map } from 'immutable';

// our interfaces
import { IBus } from './petals.interface';

export interface IWorkspace extends Map<any, any> {
  id: string;
  name: string;
  usedBy: string;
  buses: List<IBus>;
  busesInProgress: List<IBus>;
  selectedBusId: number;
}

export interface IWorkspaces {
  workspaces: List<IWorkspace>;
}
