/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// immutable
import { fromJS } from 'immutable';

// ngrx
import { ActionReducer, Action } from '@ngrx/store';

// our interfaces
import { IMinimalWorkspacesRecord, IMinimalWorkspace } from '../interfaces/minimal-workspaces.interface';
import { minimalWorkspacesFactory } from './minimal-workspaces.state';
import { FETCH_WORKSPACE, FETCH_WORKSPACE_FAILED, FETCH_WORKSPACE_SUCCESS } from './workspace.reducer';

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

  // FETCH_WORKSPACE* from workspace.reducer
  // we want to keep track of the current workspace (workspace.reducer)
  // but we also want to be aware if user requested another workspace
  if (action.type === FETCH_WORKSPACE) {
    return minWorkspacesR.setIn(['fetchingWorkspaceWithId'], action.payload);
  }

  else if (action.type ===  FETCH_WORKSPACE_FAILED) {
    return minWorkspacesR.setIn(['fetchingWorkspaceWithId'], null);
  }

  else if (action.type === FETCH_WORKSPACE_SUCCESS) {
    return minWorkspacesR.setIn(['fetchingWorkspaceWithId'], null);
  }

  // ADD_WORKSPACE*
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
