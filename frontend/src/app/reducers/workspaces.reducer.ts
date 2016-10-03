import { ActionReducer, Action } from '@ngrx/store';
import { WorkspacesStateRecord, workspacesStateFactory } from './workspaces.state';

// actions
export const WKS_CHANGE = 'USR_IS_CONNECTING';

export const WorkspacesReducer: ActionReducer<WorkspacesStateRecord> =
  (userState: WorkspacesStateRecord = workspacesStateFactory(), action: Action) => {
  switch (action.type) {
    default:
      return userState;
  }
};
