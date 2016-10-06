import { IBus } from './petals.interface';

export interface IWorkspace {
  id: number;
  name: string;
  buses: Array<IBus>;
}

export interface IWorkspaces {
  workspaces: Array<IWorkspace>;
}
