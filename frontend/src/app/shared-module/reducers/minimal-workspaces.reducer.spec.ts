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

// our reducers
import { MinimalWorkspacesReducer } from './minimal-workspaces.reducer';

// our actions
import { MinimalWorkspacesActions } from './minimal-workspaces.actions';
import { WorkspaceActions } from './workspace.actions';

// our states
import { minimalWorkspacesRecordFactory } from './minimal-workspaces.state';

// our interfaces
import { IMinimalWorkspacesRecord } from './../interfaces/minimal-workspaces.interface';

describe(`Minimal Workspaces Reducer`, () => {
  let stateR: IMinimalWorkspacesRecord;

  beforeAll(() => {
    stateR = minimalWorkspacesRecordFactory();
  });

  // DEFAULT
  it(`should return the same state (reference) if action.type doesn't match existing action`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, { type: '' });

    expect(stateR === nextStateR).toBeTruthy();
  });

  it(`should have a default state`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, { type: '' });
    let nextState = nextStateR.toJS();

    let defaultState = {
      // from server
      minimalWorkspaces: [],

      // for UI
      addingWorkspace: false,
      fetchingWorkspaces: false,
      fetchingWorkspaceWithId: null
    };

    expect(nextState).toEqual(defaultState);
  });

  // FETCH_WORKSPACES*
  it(`${MinimalWorkspacesActions.FETCH_WORKSPACES}: should toggle the flag fetching fetchingWorkspaces to true`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, { type: MinimalWorkspacesActions.FETCH_WORKSPACES });
    let nextState = nextStateR.toJS();

    expect(nextState.fetchingWorkspaces).toBeTruthy();
  });

  it(`${MinimalWorkspacesActions.FETCH_WORKSPACES_FAILED}: should toggle the flag fetching fetchingWorkspaces to false`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, { type: MinimalWorkspacesActions.FETCH_WORKSPACES_FAILED });
    let nextState = nextStateR.toJS();

    expect(nextState.fetchingWorkspaces).toBeFalsy();
  });

  it(`${MinimalWorkspacesActions.FETCH_WORKSPACES_SUCCESS}`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, {
      type: MinimalWorkspacesActions.FETCH_WORKSPACES_SUCCESS,
      payload: [1, 2]
    });

    let nextState = nextStateR.toJS();

    let expectedState = {
      fetchingWorkspaces: false,
      minimalWorkspaces: [1, 2]
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  // FETCH_WORKSPACE*
  it(`${WorkspaceActions.FETCH_WORKSPACE}`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, {
      type: WorkspaceActions.FETCH_WORKSPACE,
      payload: 'idOfSomeWorkspace'
    });

    let nextState = nextStateR.toJS();

    let expectedState = {
      fetchingWorkspaceWithId: 'idOfSomeWorkspace'
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${WorkspaceActions.FETCH_WORKSPACE_FAILED}`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, { type: WorkspaceActions.FETCH_WORKSPACE_FAILED });
    let nextState = nextStateR.toJS();

    let expectedState = {
      fetchingWorkspaceWithId: null
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${WorkspaceActions.FETCH_WORKSPACE_SUCCESS}`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, { type: WorkspaceActions.FETCH_WORKSPACE_SUCCESS });
    let nextState = nextStateR.toJS();

    let expectedState = {
      fetchingWorkspaceWithId: null
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  // ADD_WORKSPACE*
  it(`${MinimalWorkspacesActions.ADD_WORKSPACE}`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, { type: MinimalWorkspacesActions.ADD_WORKSPACE });
    let nextState = nextStateR.toJS();

    expect(nextState.addingWorkspace).toBeTruthy();
  });

  it(`${MinimalWorkspacesActions.ADD_WORKSPACE_SUCCESS}`, () => {
    let nextState1R: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, {
      type: MinimalWorkspacesActions.ADD_WORKSPACE_SUCCESS,
      payload: { id: 'idWorkspace1', name: 'W1', usedBy: 'Only me' }
     });

    let nextState1 = nextState1R.toJS();

    let expectedState1 = {
      addingWorkspace: false,
      minimalWorkspaces: [
        { id: 'idWorkspace1', name: 'W1', usedBy: 'Only me' }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // if another workspace is added, it should be in last position
    let nextState2R: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(nextState1R, {
      type: MinimalWorkspacesActions.ADD_WORKSPACE_SUCCESS,
      payload: { id: 'idWorkspace2', name: 'W2', usedBy: 'Only me' }
     });

    let nextState2 = nextState2R.toJS();

    let expectedState2 = {
      addingWorkspace: false,
      minimalWorkspaces: [
        { id: 'idWorkspace1', name: 'W1', usedBy: 'Only me' },
        { id: 'idWorkspace2', name: 'W2', usedBy: 'Only me' }
      ]
    };

    expect(nextState2).toEqual(jasmine.objectContaining(expectedState2));
  });

  it(`${MinimalWorkspacesActions.ADD_WORKSPACE_FAILED}`, () => {
    let nextStateR: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(stateR, { type: MinimalWorkspacesActions.ADD_WORKSPACE_FAILED });
    let nextState = nextStateR.toJS();

    let expectedState = {
      addingWorkspace: false
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });
});
