// immutable
import { fromJS } from 'immutable';

// ngrx
import { ActionReducer, Action } from '@ngrx/store';

// our interfaces
import { IMinimalWorkspacesRecord, IMinimalWorkspace } from '../interfaces/minimal-workspaces.interface';
import { minimalWorkspacesFactory } from './minimal-workspaces.state';

// actions
export const FETCH_WORKSPACES = 'FETCH_WORKSPACES';
export const FETCH_WORKSPACES_SUCCESS = 'FETCH_WORKSPACES_SUCCESS';
export const FETCH_WORKSPACES_FAILED = 'FETCH_WORKSPACES_FAILED';

export const ADD_WORKSPACE = 'ADD_WORKSPACE';
export const ADD_WORKSPACE_SUCCESS = 'ADD_WORKSPACE_SUCCESS';
export const ADD_WORKSPACE_FAILED = 'ADD_WORKSPACE_FAILED';

function createMinimalWorkspacesReducer(minWorkspacesR: IMinimalWorkspacesRecord = minimalWorkspacesFactory(), action: Action) {
  if (action.type === FETCH_WORKSPACES) {
    return minWorkspacesR.setIn(['fetchingWorkspaces'], true);
  }

  else if (action.type ===  FETCH_WORKSPACES_FAILED) {
    return minWorkspacesR.setIn(['fetchingWorkspaces'], false);
  }

  else if (action.type === FETCH_WORKSPACES_SUCCESS) {
    return minWorkspacesR
      .setIn(['fetchingWorkspaces'], false)
      // when we reload all the workspaces
      // the payload is plain javascript object
      .setIn(['minimalWorkspaces'], fromJS(action.payload));
  }

  else if (action.type === ADD_WORKSPACE) {
    return minWorkspacesR.set('addingWorkspace', true);
  }

  else if (action.type === ADD_WORKSPACE_SUCCESS) {
    let newMinimalWorkspace: IMinimalWorkspace;
    newMinimalWorkspace = fromJS(action.payload);

    return minWorkspacesR
      .set('addingWorkspace', false)
      .set('minimalWorkspaces',
        minWorkspacesR.get('minimalWorkspaces').push(newMinimalWorkspace)
      );
  }

  else if (action.type === ADD_WORKSPACE_FAILED) {
    return minWorkspacesR.set('addingWorkspace', false);
  }

  return minWorkspacesR;
};

export const MinimalWorkspacesReducer: ActionReducer<IMinimalWorkspacesRecord> = createMinimalWorkspacesReducer;
