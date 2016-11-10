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

// our actions
import { FETCH_WORKSPACE, FETCH_WORKSPACE_FAILED, FETCH_WORKSPACE_SUCCESS } from './workspace.reducer';
import {
  MinimalWorkspacesReducer,
  FETCH_WORKSPACES,
  FETCH_WORKSPACES_SUCCESS,
  FETCH_WORKSPACES_FAILED,
  ADD_WORKSPACE,
  ADD_WORKSPACE_SUCCESS,
  ADD_WORKSPACE_FAILED
} from './minimal-workspaces.reducer';

// our states
import { minimalWorkspacesRecordFactory } from './minimal-workspaces.state';

// our interfaces
import { IMinimalWorkspaces, IMinimalWorkspacesRecord } from './../interfaces/minimal-workspaces.interface';

describe(`Minimal Workspaces Reducer`, () => {
  let state: IMinimalWorkspacesRecord;

  beforeAll(() => {
    state = minimalWorkspacesRecordFactory();
  });

  // DEFAULT
  it(`should return the same state (reference) if action.type doesn't match existing action`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, { type: '' });

    expect(state === nextState).toBeTruthy();
  });

  it(`should have a default state`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, { type: '' }).toJS();

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
  it(`${FETCH_WORKSPACES}: should toggle the flag fetching fetchingWorkspaces to true`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, { type: FETCH_WORKSPACES }).toJS();

    expect(nextState.fetchingWorkspaces).toBeTruthy();
  });

  it(`${FETCH_WORKSPACES_FAILED}: should toggle the flag fetching fetchingWorkspaces to false`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, { type: FETCH_WORKSPACES_FAILED }).toJS();

    expect(nextState.fetchingWorkspaces).toBeFalsy();
  });

  it(`${FETCH_WORKSPACES_SUCCESS}`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, {
      type: FETCH_WORKSPACES_SUCCESS,
      payload: [1, 2]
    }).toJS();

    let expectedState = {
      fetchingWorkspaces: false,
      minimalWorkspaces: [1, 2]
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  // FETCH_WORKSPACE*
  it(`${FETCH_WORKSPACE}`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, {
      type: FETCH_WORKSPACE,
      payload: 'idOfSomeWorkspace'
    }).toJS();

    let expectedState = {
      fetchingWorkspaceWithId: 'idOfSomeWorkspace'
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${FETCH_WORKSPACE_FAILED}`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, { type: FETCH_WORKSPACE_FAILED }).toJS();

    let expectedState = {
      fetchingWorkspaceWithId: null
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${FETCH_WORKSPACE_SUCCESS}`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, { type: FETCH_WORKSPACE_SUCCESS }).toJS();

    let expectedState = {
      fetchingWorkspaceWithId: null
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  // ADD_WORKSPACE*
  it(`${ADD_WORKSPACE}`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, { type: ADD_WORKSPACE }).toJS();

    expect(nextState.addingWorkspace).toBeTruthy();
  });

  it(`${ADD_WORKSPACE_SUCCESS}`, () => {
    let nextState1R: IMinimalWorkspacesRecord = MinimalWorkspacesReducer(state, {
      type: ADD_WORKSPACE_SUCCESS,
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
      type: ADD_WORKSPACE_SUCCESS,
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

  it(`${ADD_WORKSPACE_FAILED}`, () => {
    let nextState: IMinimalWorkspaces = MinimalWorkspacesReducer(state, { type: ADD_WORKSPACE_FAILED }).toJS();

    let expectedState = {
      addingWorkspace: false
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });
});
