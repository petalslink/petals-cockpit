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

// our actions
import {
  WorkspaceReducer,
  FETCH_WORKSPACE,
  FETCH_WORKSPACE_SUCCESS,
  FETCH_WORKSPACE_FAILED,
  EDIT_PETALS_SEARCH,
  DELETE_PETALS_SEARCH,
  IMPORT_BUS,
  IMPORT_BUS_SUCCESS,
  IMPORT_BUS_FAILED,
  IMPORT_BUS_MINIMAL_CONFIG,
  ADD_BUS_SUCCESS,
  ADD_BUS_FAILED
} from './workspace.reducer';

// our states
import { workspaceRecordFactory } from './workspace.state';

// our interfaces
import { IWorkspaceRecord } from './../interfaces/workspace.interface';

describe(`Workspace Reducer`, () => {
  let stateR: IWorkspaceRecord;

  beforeAll(() => {
    stateR = workspaceRecordFactory();
  });

  // DEFAULT
  it(`should return the same state (reference) if action.type doesn't match existing action`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: '' });

    expect(stateR === nextStateR).toBeTruthy();
  });

  it(`should have a default state`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: '' });
    let nextState = nextStateR.toJS();

    let defaultState = {
      // IMinimalWorkspace
      // -----------------
      // from server
      id: null,
      name: null,
      usedBy: null,

      // ------------------------

      // IWorkspace
      // ----------
      // from server
      buses: [],
      busesInProgress: [],

      // for UI
      searchPetals: '',
      fetchingWorkspace: false,
      importingBus: false,
      gettingBusConfig: false,

      selectedBusId: null,
      selectedContainerId: null,
      selectedComponentId: null,
      selectedServiceUnitId: null
    };

    expect(nextState).toEqual(defaultState);
  });

  // FETCH_WORKSPACE*
  it(`${FETCH_WORKSPACE}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: FETCH_WORKSPACE });
    let nextState = nextStateR.toJS();

    let expectedState = {
      fetchingWorkspace: true
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${FETCH_WORKSPACE_SUCCESS}`, () => {
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateR, {
      type: FETCH_WORKSPACE_SUCCESS,
      payload: {
        id: 'id1',
        data: {
          busesInProgress: [],
          buses: []
        }
      }
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      searchPetals: '',
      fetchingWorkspace: false,
      id: 'id1',
      buses: [],
      busesInProgress: []
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // ------------------------------------

    // check that if user reloads the same workspace, we don't wipe searchPetals
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      nextStateR1.set('searchPetals', 'bus 1'),
      {
        type: FETCH_WORKSPACE_SUCCESS,
        payload: {
          id: 'id1',
          data: {
            busesInProgress: [],
            buses: []
          }
        }
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = {
      searchPetals: 'bus 1',
      fetchingWorkspace: false,
      id: 'id1',
      buses: [],
      busesInProgress: []
    };

    expect(nextState2).toEqual(jasmine.objectContaining(expectedState2));

    // ------------------------------------

    // check that if user changes workspace, wipe searchPetals
    let nextStateR3: IWorkspaceRecord = WorkspaceReducer(
      nextStateR2,
      {
        type: FETCH_WORKSPACE_SUCCESS,
        payload: {
          id: 'id3',
          data: {
            busesInProgress: [],
            buses: []
          }
        }
      }
    );
    let nextState3 = nextStateR3.toJS();

    let expectedState3 = {
      searchPetals: '',
      fetchingWorkspace: false,
      id: 'id3',
      buses: [],
      busesInProgress: []
    };

    expect(nextState3).toEqual(jasmine.objectContaining(expectedState3));
  });

  it(`${FETCH_WORKSPACE_FAILED}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: FETCH_WORKSPACE_FAILED });
    let nextState = nextStateR.toJS();

    expect(nextState.fetchingWorkspace).toBeFalsy();
  });

  // EDIT_PETALS_SEARCH
  it(`${EDIT_PETALS_SEARCH}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: EDIT_PETALS_SEARCH, payload: 'bus 1' });
    let nextState = nextStateR.toJS();

    expect(nextState.searchPetals).toEqual('bus 1');
  });

  // DELETE_PETALS_SEARCH
  it(`${DELETE_PETALS_SEARCH}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: DELETE_PETALS_SEARCH });
    let nextState = nextStateR.toJS();

    expect(nextState.searchPetals).toEqual('');
  });

  // IMPORT_BUS*
  it(`${IMPORT_BUS}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: IMPORT_BUS });
    let nextState = nextStateR.toJS();

    expect(nextState.importingBus).toBeTruthy();
  });

  it(`${IMPORT_BUS_SUCCESS}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: IMPORT_BUS_SUCCESS });
    let nextState = nextStateR.toJS();

    expect(nextState.importingBus).toBeFalsy();
  });

  it(`${IMPORT_BUS_FAILED}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: IMPORT_BUS_FAILED });
    let nextState = nextStateR.toJS();

    expect(nextState.importingBus).toBeFalsy();
  });

  // IMPORT_BUS_MINIMAL_CONFIG
  it(`${IMPORT_BUS_MINIMAL_CONFIG}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, {
      type: IMPORT_BUS_MINIMAL_CONFIG,
      payload: {
        id: 'id1',
        ip: '192.168.1.1',
        port: '5000',
        username: 'admin',
        password: 'admin',
        passphrase: 'myPassPhrase'
      }
    });
    let nextState = nextStateR.toJS();

    let expectedState = {
      importingBus: false,
      busesInProgress: [{
        id: 'id1',
        config: {
          ip: '192.168.1.1',
          port: 5000,
          login: 'admin',
          password: 'admin',
          passphrase: 'myPassPhrase'
        }
      }]
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  // ADD_BUS*
  it(`${ADD_BUS_SUCCESS}`, () => {
    let bus1 = {
      id: 'id1',
      name: 'bus 1',
      state: 'UNDEPLOYED',
      containers: []
    };

    let bus2 = {
      id: 'id2',
      name: 'bus 2',
      state: 'UNDEPLOYED',
      containers: []
    };

    let nextStateR: IWorkspaceRecord = WorkspaceReducer(
      // if a bus with an ID x is in buses in progress ...
      stateR.set('busesInProgress', fromJS([bus1, bus2])),
      {
        // when we add that bus ...
        type: ADD_BUS_SUCCESS,
        payload: bus1
      }
    );

    let nextState = nextStateR.toJS();

    let expectedState = {
      // it should be removed from busesInProgress ...
      busesInProgress: [bus2],
      // and added to buses
      buses: [bus1]
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${ADD_BUS_FAILED}`, () => {
    let bus1 = {
      id: 'id1',
      name: 'bus 1',
      state: 'UNDEPLOYED',
      containers: []
    };

    let bus2 = {
      id: 'id2',
      name: 'bus 2',
      state: 'UNDEPLOYED',
      containers: []
    };

    stateR = stateR.set('busesInProgress', fromJS([bus1, bus2]));

    // first, check that the buses doesn't have any error
    expect(stateR.getIn(['busesInProgress', 0, 'importError'])).toBeUndefined();
    expect(stateR.getIn(['busesInProgress', 1, 'importError'])).toBeUndefined();

    let nextStateR: IWorkspaceRecord = WorkspaceReducer(
      stateR,
      {
        type: ADD_BUS_FAILED,
        payload: {
          idBus: bus2.id,
          errorMsg: 'Some error'
        }
      }
    );

    let nextState = nextStateR.toJS();

    let expectedState = {
      busesInProgress: [
        bus1,
        // then check that the bus which failed to import contains the error
        Object.assign({}, bus2, { importError: 'Some error' })
      ],
      buses: []
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });
});
