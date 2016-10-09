import { ActionReducer, Action } from '@ngrx/store';
import { WorkspacesStateRecord, workspacesStateFactory } from './workspaces.state';

// actions
export const CHANGE_SELECTED_WORKSPACE = 'CHANGE_SELECTED_WORKSPACE';


export function createWorkspacesReducer(workspacesState: WorkspacesStateRecord = workspacesStateFactory(), action: Action) {
  switch (action.type) {
    case CHANGE_SELECTED_WORKSPACE:
      return workspacesState.setIn(['selectedWorkspaceId'], action.payload);

    default:
      return workspacesState;
  }
};

export const WorkspacesReducer: ActionReducer<WorkspacesStateRecord> = createWorkspacesReducer;

