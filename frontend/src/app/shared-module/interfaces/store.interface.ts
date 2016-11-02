// our interfaces
import { IWorkspaceRecord } from './workspace.interface';
import { IMinimalWorkspacesRecord } from './minimal-workspaces.interface';
import { IUserRecord } from './user.interface';
import { IConfigRecord } from './config.interface';

export interface IStore {
  config: IConfigRecord;
  user: IUserRecord;
  minimalWorkspaces: IMinimalWorkspacesRecord;
  workspace: IWorkspaceRecord;
};
