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
import { IMinimalWorkspaceRecord, IMinimalWorkspacesRecord } from '../interfaces/minimal-workspaces.interface';

// our states
import { minimalWorkspacesRecordFactory } from './minimal-workspaces.state';

// our actions
import { MinimalWorkspacesActions } from './minimal-workspaces.actions';
import { WorkspaceActions } from './workspace.actions';
import { UserActions } from './user.actions';

function createMinimalWorkspacesReducer(minWorkspacesR: IMinimalWorkspacesRecord = minimalWorkspacesRecordFactory(), action: Action) {
  if (action.type === MinimalWorkspacesActions.FETCH_WORKSPACES) {
    return minWorkspacesR.set('fetchingWorkspaces', true);
  }

  else if (action.type === MinimalWorkspacesActions.FETCH_WORKSPACES_FAILED) {
    return minWorkspacesR.set('fetchingWorkspaces', false);
  }

  else if (action.type === MinimalWorkspacesActions.FETCH_WORKSPACES_SUCCESS) {
    return minWorkspacesR
      .merge({
        fetchingWorkspaces: false,
        // when we reload all the workspaces
        // the payload is plain javascript object
        minimalWorkspaces: fromJS(action.payload)
      });
  }

  // FETCH_WORKSPACE* from workspace.reducer
  // we want to keep track of the current workspace (workspace.reducer)
  // but we also want to be aware if user requested another workspace
  if (action.type === WorkspaceActions.FETCH_WORKSPACE) {
    return minWorkspacesR.set('fetchingWorkspaceWithId', action.payload);
  }

  else if (action.type === WorkspaceActions.FETCH_WORKSPACE_FAILED) {
    return minWorkspacesR.set('fetchingWorkspaceWithId', null);
  }

  else if (action.type === WorkspaceActions.FETCH_WORKSPACE_SUCCESS) {
    return minWorkspacesR.set('fetchingWorkspaceWithId', null);
  }

  // ADD_WORKSPACE*
  else if (action.type === MinimalWorkspacesActions.ADD_WORKSPACE) {
    return minWorkspacesR.set('addingWorkspace', true);
  }

  else if (action.type === MinimalWorkspacesActions.ADD_WORKSPACE_SUCCESS) {
    let newMinimalWorkspace: IMinimalWorkspaceRecord;
    newMinimalWorkspace = fromJS(action.payload);

    return minWorkspacesR
      .merge({
        addingWorkspace: false,
        minimalWorkspaces: minWorkspacesR.get('minimalWorkspaces').push(newMinimalWorkspace)
      });
  }

  else if (action.type === MinimalWorkspacesActions.ADD_WORKSPACE_FAILED) {
    return minWorkspacesR.set('addingWorkspace', false);
  }

  if (action.type === UserActions.USR_IS_DISCONNECTED) {
    return minimalWorkspacesRecordFactory();
  }

  return minWorkspacesR;
};

export const MinimalWorkspacesReducer: ActionReducer<IMinimalWorkspacesRecord> = createMinimalWorkspacesReducer;
