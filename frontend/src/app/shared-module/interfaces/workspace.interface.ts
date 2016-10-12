import { List, Map } from 'immutable';

// our interfaces
import { IBus } from './petals.interface';

export interface IWorkspace extends Map<any, any> {
  id: number;
  name: string;
  buses: List<IBus>;
  selectedBusId: number;
}

export interface IWorkspaces {
  workspaces: List<IWorkspace>;
}
