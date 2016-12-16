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

// our reducers
import { WorkspaceReducer } from './workspace.reducer';

// our actions
import { UserActions } from './user.actions';
import { WorkspaceActions } from './workspace.actions';

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
  it(`${WorkspaceActions.FETCH_WORKSPACE}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.FETCH_WORKSPACE });
    let nextState = nextStateR.toJS();

    let expectedState = {
      fetchingWorkspace: true
    };

    expect(nextState).toEqual(jasmine.objectContaining(expectedState));
  });

  it(`${WorkspaceActions.FETCH_WORKSPACE_SUCCESS}`, () => {
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateR, {
      type: WorkspaceActions.FETCH_WORKSPACE_SUCCESS,
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
        type: WorkspaceActions.FETCH_WORKSPACE_SUCCESS,
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
        type: WorkspaceActions.FETCH_WORKSPACE_SUCCESS,
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

  it(`${WorkspaceActions.FETCH_WORKSPACE_FAILED}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.FETCH_WORKSPACE_FAILED });
    let nextState = nextStateR.toJS();

    expect(nextState.fetchingWorkspace).toBeFalsy();
  });

  it(`${WorkspaceActions.RESET_WORKSPACE}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.RESET_WORKSPACE });
    let nextState = nextStateR.toJS();

    expect(workspaceRecordFactory().toJS()).toEqual(nextState);
  });

  // EDIT_PETALS_SEARCH
  it(`${WorkspaceActions.EDIT_PETALS_SEARCH}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.EDIT_PETALS_SEARCH, payload: 'bus 1' });
    let nextState = nextStateR.toJS();

    expect(nextState.searchPetals).toEqual('bus 1');
  });

  // DELETE_PETALS_SEARCH
  it(`${WorkspaceActions.DELETE_PETALS_SEARCH}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.DELETE_PETALS_SEARCH });
    let nextState = nextStateR.toJS();

    expect(nextState.searchPetals).toEqual('');
  });

  // IMPORT_BUS*
  it(`${WorkspaceActions.IMPORT_BUS}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.IMPORT_BUS });
    let nextState = nextStateR.toJS();

    expect(nextState.importingBus).toBeTruthy();
  });

  it(`${WorkspaceActions.IMPORT_BUS_SUCCESS}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.IMPORT_BUS_SUCCESS });
    let nextState = nextStateR.toJS();

    expect(nextState.importingBus).toBeFalsy();
  });

  it(`${WorkspaceActions.IMPORT_BUS_FAILED}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.IMPORT_BUS_FAILED });
    let nextState = nextStateR.toJS();

    expect(nextState.importingBus).toBeFalsy();
  });

  // IMPORT_BUS_MINIMAL_CONFIG
  it(`${WorkspaceActions.IMPORT_BUS_MINIMAL_CONFIG}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, {
      type: WorkspaceActions.IMPORT_BUS_MINIMAL_CONFIG,
      payload: {
        id: 'id1',
        importIp: '192.168.1.1',
        // even if server send a number,
        // let's test that it works with a string
        importPort: '5000',
        importUsername: 'admin',
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
  it(`${WorkspaceActions.ADD_BUS_SUCCESS}`, () => {
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
        type: WorkspaceActions.ADD_BUS_SUCCESS,
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

  it(`${WorkspaceActions.ADD_BUS_FAILED}`, () => {
    // test with no buses in progress
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.ADD_BUS_FAILED, payload: 'someId' });
    let nextState1 = nextStateR1.toJS();

    expect(nextState1.busesInProgress).toEqual([]);

    // test with some buses in progress
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

    let newStateR = stateR.set('busesInProgress', fromJS([bus1, bus2]));

    // first, check that the buses doesn't have any error
    expect(newStateR.getIn(['busesInProgress', 0, 'importError'])).toBeUndefined();
    expect(newStateR.getIn(['busesInProgress', 1, 'importError'])).toBeUndefined();

    let nextStateR: IWorkspaceRecord = WorkspaceReducer(
      newStateR,
      {
        type: WorkspaceActions.ADD_BUS_FAILED,
        payload: {
          id: bus2.id,
          importError: 'Some error'
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

  // REMOVE_BUS*
  it(`${WorkspaceActions.REMOVE_BUS}`, () => {
    // try to remove when no busesInProgress
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.REMOVE_BUS, payload: 'someId' });
    let nextState1 = nextStateR1.toJS();

    expect(nextState1.busesInProgress).toEqual([]);

    // try to flag the first bus as removing
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('busesInProgress', buses => fromJS([
        { id: 'id1', removing: false },
        { id: 'id2', removing: false },
        { id: 'id3', removing: false }
      ])),
      {
        type: WorkspaceActions.REMOVE_BUS,
        payload: 'id2'
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = [
        { id: 'id1', removing: false },
        { id: 'id2', removing: true },
        { id: 'id3', removing: false }
    ];

    expect(nextState2.busesInProgress).toEqual(jasmine.objectContaining(expectedState2));
  });

  it(`${WorkspaceActions.REMOVE_BUS_FAILED}`, () => {
    // try to remove when no busesInProgress
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateR, { type: WorkspaceActions.REMOVE_BUS_FAILED, payload: 'someId' });
    let nextState1 = nextStateR1.toJS();

    expect(nextState1.busesInProgress).toEqual([]);

    // try to flag the first bus as removing
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('busesInProgress', buses => fromJS([
        { id: 'id1', removing: false },
        { id: 'id2', removing: false },
        { id: 'id3', removing: false }
      ])),
      {
        type: WorkspaceActions.REMOVE_BUS_FAILED,
        payload: 'id2'
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = [
        { id: 'id1', removing: false },
        { id: 'id2', removing: false },
        { id: 'id3', removing: false }
    ];

    expect(nextState2.busesInProgress).toEqual(jasmine.objectContaining(expectedState2));
  });

  it(`${WorkspaceActions.REMOVE_BUS_SUCCESS}`, () => {
    // try to remove when no busesInProgress
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('busesInProgress', buses => fromJS([
        { id: 'id1' },
        { id: 'id2' },
        { id: 'id3' }
      ])),
      {
        type: WorkspaceActions.REMOVE_BUS_SUCCESS,
        payload: { idBus: 'id2' }
      }
    );
    let nextState = nextStateR.toJS();

    let expectedState = [
        { id: 'id1' },
        { id: 'id3' }
    ];

    expect(nextState.busesInProgress).toEqual(jasmine.objectContaining(expectedState));
  });

  // FETCH_BUS_DETAILS*
  it(`${WorkspaceActions.FETCH_BUS_DETAILS}`, () => {
    let stateRWithBus = stateR.update('buses', buses => fromJS([
      { id: 'idBus1' },
      { id: 'idBus2' },
      { id: 'idBus3' }
    ]));

    // try to fetch details of a non existant bus
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(
      stateRWithBus,
      {
        type: WorkspaceActions.FETCH_BUS_DETAILS,
        payload: { idBus: 'randomId' }
      }
    );

    expect(stateRWithBus).toEqual(nextStateR1);

    // try to fetch details of an existing bus
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('buses', buses => fromJS([
        { id: 'idBus1', isFetchingDetails: false },
        { id: 'idBus2', isFetchingDetails: false },
        { id: 'idBus3', isFetchingDetails: false }
      ])),
      {
        type: WorkspaceActions.FETCH_BUS_DETAILS,
        payload: { idBus: 'idBus2' }
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = [
        { id: 'idBus1', isFetchingDetails: false },
        { id: 'idBus2', isFetchingDetails: true },
        { id: 'idBus3', isFetchingDetails: false }
    ];

    expect(nextState2.buses).toEqual(jasmine.objectContaining(expectedState2));
  });

  it(`${WorkspaceActions.FETCH_BUS_DETAILS_SUCCESS}`, () => {
    let stateRWithBus = stateR.update('buses', buses => fromJS([
      { id: 'idBus1', isFetchingDetails: true },
      { id: 'idBus2', isFetchingDetails: true },
      { id: 'idBus3', isFetchingDetails: true }
    ]));

    // try set details of a non existant bus
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(
      stateRWithBus,
      {
        type: WorkspaceActions.FETCH_BUS_DETAILS_SUCCESS,
        // as we want to fetch every details (that may changes),
        // we apply a merge. It means that we can pass any key: value and
        // it'll be added to the bus
        payload: { id: 'randomId' }
      }
    );

    expect(stateRWithBus).toEqual(nextStateR1);

    // try set details of an existing bus
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('buses', buses => fromJS([
        { id: 'idBus1', isFetchingDetails: true },
        { id: 'idBus2', isFetchingDetails: true },
        { id: 'idBus3', isFetchingDetails: true }
      ])),
      {
        type: WorkspaceActions.FETCH_BUS_DETAILS_SUCCESS,
        payload: {
          id: 'idBus2',
          randomValue1: 'random value 1',
          randomValue2: 'random value 2'
        }
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = [
        { id: 'idBus1', isFetchingDetails: true },
        { id: 'idBus2', isFetchingDetails: false, randomValue1: 'random value 1', randomValue2: 'random value 2' },
        { id: 'idBus3', isFetchingDetails: true }
    ];

    expect(nextState2.buses).toEqual(jasmine.objectContaining(expectedState2));
  });

  it(`${WorkspaceActions.FETCH_BUS_DETAILS_FAILED}`, () => {
    let stateRWithBus = stateR.update('buses', buses => fromJS([
      { id: 'idBus1' },
      { id: 'idBus2' },
      { id: 'idBus3' }
    ]));

    // on non existing bus
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(
      stateRWithBus,
      {
        type: WorkspaceActions.FETCH_BUS_DETAILS_FAILED,
        payload: { idBus: 'randomId' }
      }
    );

    expect(stateRWithBus).toEqual(nextStateR1);

    // on an existing bus
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('buses', buses => fromJS([
        { id: 'idBus1', isFetchingDetails: true },
        { id: 'idBus2', isFetchingDetails: true },
        { id: 'idBus3', isFetchingDetails: true }
      ])),
      {
        type: WorkspaceActions.FETCH_BUS_DETAILS_FAILED,
        payload: { idBus: 'idBus2' }
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = [
        { id: 'idBus1', isFetchingDetails: true },
        { id: 'idBus2', isFetchingDetails: false },
        { id: 'idBus3', isFetchingDetails: true }
    ];

    expect(nextState2.buses).toEqual(jasmine.objectContaining(expectedState2));
  });

  // FETCH_CONTAINER_DETAILS*
  it(`${WorkspaceActions.FETCH_CONTAINER_DETAILS}`, () => {
    let stateRWithBus = stateR.set('buses', fromJS([
      { id: 'idBus1' },
      {
        id: 'idBus2',
        containers: [
          { id: 'idContainer1' },
          { id: 'idContainer2' },
          { id: 'idContainer3' }
        ]
      },
      { id: 'idBus3' }
    ]));

    // try to fetch details of a non existant container
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(
      stateRWithBus,
      {
        type: WorkspaceActions.FETCH_CONTAINER_DETAILS,
        payload: { idBus: 'idBus2', idContainer: 'randomId' }
      }
    );

    expect(stateRWithBus).toEqual(nextStateR1);

    // try to fetch details of an existing container
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('buses', buses => fromJS([
        { id: 'idBus1' },
        {
          id: 'idBus2',
          containers: [
            { id: 'idContainer1', isFetchingDetails: false },
            { id: 'idContainer2', isFetchingDetails: false },
            { id: 'idContainer3', isFetchingDetails: false }
          ]
        },
        { id: 'idBus3' }
      ])),
      {
        type: WorkspaceActions.FETCH_CONTAINER_DETAILS,
        payload: { idBus: 'idBus2', idContainer: 'idContainer2' }
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = [
      { id: 'idBus1' },
      {
        id: 'idBus2',
        containers: [
          { id: 'idContainer1', isFetchingDetails: false },
          { id: 'idContainer2', isFetchingDetails: true },
          { id: 'idContainer3', isFetchingDetails: false }
        ]
      },
      { id: 'idBus3' }
    ];

    expect(nextState2.buses).toEqual(jasmine.objectContaining(expectedState2));
  });

  it(`${WorkspaceActions.FETCH_CONTAINER_DETAILS_SUCCESS}`, () => {
    let stateRWithBus = stateR.set('buses', fromJS([
      { id: 'idBus1' },
      {
        id: 'idBus2',
        containers: [
          { id: 'idContainer1' },
          { id: 'idContainer2' },
          { id: 'idContainer3' }
        ]
      },
      { id: 'idBus3' }
    ]));

    // try to set details of a non existant container
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(
      stateRWithBus,
      {
        type: WorkspaceActions.FETCH_CONTAINER_DETAILS_SUCCESS,
        payload: {
          bus: {
            id: 'idBus2',
            container: {
              id: 'randomId'
            }
          }
        }
      }
    );

    expect(stateRWithBus).toEqual(nextStateR1);

    // try to set details of an existing container
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('buses', buses => fromJS([
        { id: 'idBus1' },
        {
          id: 'idBus2',
          containers: [
            { id: 'idContainer1', isFetchingDetails: false },
            { id: 'idContainer2', isFetchingDetails: true },
            { id: 'idContainer3', isFetchingDetails: false }
          ]
        },
        { id: 'idBus3' }
      ])),
      {
        type: WorkspaceActions.FETCH_CONTAINER_DETAILS_SUCCESS,
        // as we merge values from bus.container into the selected container
        // we should be able to merge new values
        payload: {
          bus: {
            id: 'idBus2',
            container: {
              id: 'idContainer2',
              someRandomKey: 'random value'
            }
          }
        }
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = [
      { id: 'idBus1' },
      {
        id: 'idBus2',
        containers: [
          { id: 'idContainer1', isFetchingDetails: false },
          { id: 'idContainer2', isFetchingDetails: false, someRandomKey: 'random value' },
          { id: 'idContainer3', isFetchingDetails: false }
        ]
      },
      { id: 'idBus3' }
    ];

    expect(nextState2.buses).toEqual(jasmine.objectContaining(expectedState2));
  });

  it(`${WorkspaceActions.FETCH_CONTAINER_DETAILS_FAILED}`, () => {
    let stateRWithBus = stateR.set('buses', fromJS([
      { id: 'idBus1' },
      {
        id: 'idBus2',
        containers: [
          { id: 'idContainer1' },
          { id: 'idContainer2' },
          { id: 'idContainer3' }
        ]
      },
      { id: 'idBus3' }
    ]));

    // try to fetch details of a non existant container
    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(
      stateRWithBus,
      {
        type: WorkspaceActions.FETCH_CONTAINER_DETAILS,
        payload: { idBus: 'idBus2', idContainer: 'randomId' }
      }
    );

    expect(stateRWithBus).toEqual(nextStateR1);

    // try to fetch details of an existing container
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(
      stateR.update('buses', buses => fromJS([
        { id: 'idBus1' },
        {
          id: 'idBus2',
          containers: [
            { id: 'idContainer1', isFetchingDetails: false },
            { id: 'idContainer2', isFetchingDetails: false },
            { id: 'idContainer3', isFetchingDetails: false }
          ]
        },
        { id: 'idBus3' }
      ])),
      {
        type: WorkspaceActions.FETCH_CONTAINER_DETAILS,
        payload: { idBus: 'idBus2', idContainer: 'idContainer2' }
      }
    );
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = [
      { id: 'idBus1' },
      {
        id: 'idBus2',
        containers: [
          { id: 'idContainer1', isFetchingDetails: false },
          { id: 'idContainer2', isFetchingDetails: true },
          { id: 'idContainer3', isFetchingDetails: false }
        ]
      },
      { id: 'idBus3' }
    ];

    expect(nextState2.buses).toEqual(jasmine.objectContaining(expectedState2));
  });

  // TODO: FETCH_COMPONENT_DETAILS*
  it(`${WorkspaceActions.FETCH_COMPONENT_DETAILS}`, () => {
    // TODO once the refactor to flatten the structure is done
  });

  it(`${WorkspaceActions.FETCH_COMPONENT_DETAILS_SUCCESS}`, () => {
    // TODO once the refactor to flatten the structure is done
  });

  it(`${WorkspaceActions.FETCH_COMPONENT_DETAILS_FAILED}`, () => {
    // TODO once the refactor to flatten the structure is done
  });

  // FETCH_BUS_CONFIG*
  xit(`${WorkspaceActions.FETCH_BUS_CONFIG}`, () => {
    // TODO
  });

  xit(`${WorkspaceActions.FETCH_BUS_CONFIG_SUCCESS}`, () => {
    // TODO
  });

  xit(`${WorkspaceActions.FETCH_BUS_CONFIG_FAILED}`, () => {
    // TODO
  });

  xit(`${WorkspaceActions.SET_ID_BUS_CONTAINER_COMPONENT_SERVICE_UNIT}`, () => {
    // TODO
  });

  // (UN)FOLD_BUS
  it(`${WorkspaceActions.FOLD_BUS}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      { id: 'id1', name: 'Bus 1' },
      { id: 'id2', name: 'Bus 2' },
      { id: 'id3', name: 'Bus 3' }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, { type: WorkspaceActions.FOLD_BUS, payload: { idBus: 'id1' } });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        { id: 'id1', name: 'Bus 1', isFolded: true },
        { id: 'id2', name: 'Bus 2' },
        { id: 'id3', name: 'Bus 3' }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2 : bad ID
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.FOLD_BUS,
      payload: {idBus: 'some random id' }
    });
    let nextState2 = nextStateR2.toJS();

    expect(nextState2).toEqual(stateRWithBuses.toJS());
  });

  it(`${WorkspaceActions.UNFOLD_BUS}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      { id: 'id1', name: 'Bus 1', isFolded: true },
      { id: 'id2', name: 'Bus 2', isFolded: true },
      { id: 'id3', name: 'Bus 3', isFolded: true }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, { type: WorkspaceActions.UNFOLD_BUS, payload: { idBus: 'id1' } });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        { id: 'id1', name: 'Bus 1', isFolded: false },
        { id: 'id2', name: 'Bus 2', isFolded: true },
        { id: 'id3', name: 'Bus 3', isFolded: true }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2 : bad ID
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.FOLD_BUS,
      payload: { idBus: 'some random id' }
    });
    let nextState2 = nextStateR2.toJS();

    expect(nextState2).toEqual(stateRWithBuses.toJS());
  });

  it(`${WorkspaceActions.TOGGLE_FOLD_BUS}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      { id: 'id1', name: 'Bus 1', isFolded: true },
      { id: 'id2', name: 'Bus 2', isFolded: true },
      { id: 'id3', name: 'Bus 3', isFolded: true }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.TOGGLE_FOLD_BUS,
      payload: { idBus: 'id1' }
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        { id: 'id1', name: 'Bus 1', isFolded: false },
        { id: 'id2', name: 'Bus 2', isFolded: true },
        { id: 'id3', name: 'Bus 3', isFolded: true }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(nextStateR1, {
      type: WorkspaceActions.TOGGLE_FOLD_BUS,
      payload: { idBus: 'id1' }
    });
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = {
      buses: [
        { id: 'id1', name: 'Bus 1', isFolded: true },
        { id: 'id2', name: 'Bus 2', isFolded: true },
        { id: 'id3', name: 'Bus 3', isFolded: true }
      ]
    };

    expect(nextState2).toEqual(jasmine.objectContaining(expectedState2));

    // 3 : bad ID
    let nextStateR3: IWorkspaceRecord = WorkspaceReducer(nextStateR2, {
      type: WorkspaceActions.FOLD_BUS, payload: { idBus: 'some random id' }
    });

    expect(nextState2).toEqual(nextStateR3.toJS());
  });

  // (UN)FOLD_CONTAINER
  it(`${WorkspaceActions.FOLD_CONTAINER}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      {
        id: 'id1',
        name: 'Bus 1',
        containers: [
          { id: 'idC1', name: 'Container 1' },
          { id: 'idC2', name: 'Container 2' }
        ]
      },
      { id: 'id2', name: 'Bus 2', containers: [] }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.FOLD_CONTAINER,
      payload: { idBus: 'id1', idContainer: 'idC1' }
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        {
          id: 'id1',
          name: 'Bus 1',
          containers: [
            { id: 'idC1', name: 'Container 1', isFolded: true },
            { id: 'idC2', name: 'Container 2' }
          ]
        },
        { id: 'id2', name: 'Bus 2', containers: [] }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2 : bad ID
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.FOLD_CONTAINER,
      payload: { idBus: 'some random id' }
    });
    let nextState2 = nextStateR2.toJS();

    expect(nextState2).toEqual(stateRWithBuses.toJS());
  });

  it(`${WorkspaceActions.UNFOLD_CONTAINER}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      {
        id: 'id1',
        name: 'Bus 1',
        containers: [
          { id: 'idC1', name: 'Container 1', isFolded: true },
          { id: 'idC2', name: 'Container 2', isFolded: true }
        ]
      },
      { id: 'id2', name: 'Bus 2', containers: [] }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.UNFOLD_CONTAINER,
      payload: { idBus: 'id1', idContainer: 'idC1' }
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        {
          id: 'id1',
          name: 'Bus 1',
          containers: [
            { id: 'idC1', name: 'Container 1', isFolded: false },
            { id: 'idC2', name: 'Container 2', isFolded: true }
          ]
        },
        { id: 'id2', name: 'Bus 2', containers: [] }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2 : bad ID
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.FOLD_CONTAINER,
      payload: { idBus: 'some random id' }
    });
    let nextState2 = nextStateR2.toJS();

    expect(nextState2).toEqual(stateRWithBuses.toJS());
  });

  it(`${WorkspaceActions.TOGGLE_FOLD_CONTAINER}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      {
        id: 'id1',
        name: 'Bus 1',
        containers: [
          { id: 'idC1', name: 'Container 1', isFolded: true },
          { id: 'idC2', name: 'Container 2', isFolded: true }
        ]
      },
      { id: 'id2', name: 'Bus 2', containers: [] }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.TOGGLE_FOLD_CONTAINER,
      payload: { idBus: 'id1', idContainer: 'idC1' }
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        {
          id: 'id1',
          name: 'Bus 1',
          containers: [
            { id: 'idC1', name: 'Container 1', isFolded: false },
            { id: 'idC2', name: 'Container 2', isFolded: true }
          ]
        },
        { id: 'id2', name: 'Bus 2', containers: [] }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(nextStateR1, {
      type: WorkspaceActions.TOGGLE_FOLD_CONTAINER,
      payload: { idBus: 'id1', idContainer: 'idC1' }
    });
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = {
      buses: [
        {
          id: 'id1',
          name: 'Bus 1',
          containers: [
            { id: 'idC1', name: 'Container 1', isFolded: true },
            { id: 'idC2', name: 'Container 2', isFolded: true }
          ]
        },
        { id: 'id2', name: 'Bus 2', containers: [] }
      ]
    };

    expect(nextState2).toEqual(jasmine.objectContaining(expectedState2));

    // 3 : bad ID
    let nextStateR3: IWorkspaceRecord = WorkspaceReducer(nextStateR2, {
      type: WorkspaceActions.TOGGLE_FOLD_CONTAINER,
      payload: { idBus: 'some random id' }
    });

    expect(nextState2).toEqual(nextStateR3.toJS());
  });

  // (UN)FOLD_COMPONENT
  it(`${WorkspaceActions.FOLD_COMPONENT}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      {
        id: 'id1',
        name: 'Bus 1',
        containers: [
          {
            id: 'idC1',
            name: 'Container 1',
            components: [
              { id: 'idComp1', name: 'Component 1' },
              { id: 'idComp2', name: 'Component 2' }
            ]
          },
          { id: 'idC2', name: 'Container 2', components: [] }
        ]
      },
      { id: 'id2', name: 'Bus 2', containers: [] }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.FOLD_COMPONENT,
      payload: { idBus: 'id1', idContainer: 'idC1', idComponent: 'idComp1' }
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        {
          id: 'id1',
          name: 'Bus 1',
          containers: [
            {
              id: 'idC1',
              name: 'Container 1',
              components: [
                { id: 'idComp1', name: 'Component 1', isFolded: true },
                { id: 'idComp2', name: 'Component 2' }
              ]
            },
            { id: 'idC2', name: 'Container 2', components: [] }
          ]
        },
        { id: 'id2', name: 'Bus 2', containers: [] }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2 : bad ID
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.FOLD_COMPONENT,
      payload: { idBus: 'some random id' }
    });
    let nextState2 = nextStateR2.toJS();

    expect(nextState2).toEqual(stateRWithBuses.toJS());
  });

  it(`${WorkspaceActions.UNFOLD_COMPONENT}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      {
        id: 'id1',
        name: 'Bus 1',
        containers: [
          {
            id: 'idC1',
            name: 'Container 1',
            components: [
              { id: 'idComp1', name: 'Component 1', isFolded: true },
              { id: 'idComp2', name: 'Component 2', isFolded: true }
            ]
          },
          { id: 'idC2', name: 'Container 2', components: [] }
        ]
      },
      { id: 'id2', name: 'Bus 2', containers: [] }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.UNFOLD_COMPONENT,
      payload: { idBus: 'id1', idContainer: 'idC1', idComponent: 'idComp1' }
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        {
          id: 'id1',
          name: 'Bus 1',
          containers: [
            {
              id: 'idC1',
              name: 'Container 1',
              components: [
                { id: 'idComp1', name: 'Component 1', isFolded: false },
                { id: 'idComp2', name: 'Component 2', isFolded: true }
              ]
            },
            { id: 'idC2', name: 'Container 2', components: [] }
          ]
        },
        { id: 'id2', name: 'Bus 2', containers: [] }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2 : bad ID
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.FOLD_COMPONENT,
      payload: { idBus: 'some random id' }
    });
    let nextState2 = nextStateR2.toJS();

    expect(nextState2).toEqual(stateRWithBuses.toJS());
  });

  it(`${WorkspaceActions.TOGGLE_FOLD_COMPONENT}`, () => {
    // 1
    let stateRWithBuses = stateR.set('buses', fromJS([
      {
        id: 'id1',
        name: 'Bus 1',
        containers: [
          {
            id: 'idC1',
            name: 'Container 1',
            components: [
              { id: 'idComp1', name: 'Component 1', isFolded: true },
              { id: 'idComp2', name: 'Component 2', isFolded: true }
            ]
          },
          { id: 'idC2', name: 'Container 2', components: [] }
        ]
      },
      { id: 'id2', name: 'Bus 2', containers: [] }
    ]));

    let nextStateR1: IWorkspaceRecord = WorkspaceReducer(stateRWithBuses, {
      type: WorkspaceActions.TOGGLE_FOLD_COMPONENT,
      payload: { idBus: 'id1', idContainer: 'idC1', idComponent: 'idComp1' }
    });
    let nextState1 = nextStateR1.toJS();

    let expectedState1 = {
      buses: [
        {
          id: 'id1',
          name: 'Bus 1',
          containers: [
            {
              id: 'idC1',
              name: 'Container 1',
              components: [
                { id: 'idComp1', name: 'Component 1', isFolded: false },
                { id: 'idComp2', name: 'Component 2', isFolded: true }
              ]
            },
            { id: 'idC2', name: 'Container 2', components: [] }
          ]
        },
        { id: 'id2', name: 'Bus 2', containers: [] }
      ]
    };

    expect(nextState1).toEqual(jasmine.objectContaining(expectedState1));

    // 2
    let nextStateR2: IWorkspaceRecord = WorkspaceReducer(nextStateR1, {
      type: WorkspaceActions.TOGGLE_FOLD_COMPONENT,
      payload: { idBus: 'id1', idContainer: 'idC1', idComponent: 'idComp1' }
    });
    let nextState2 = nextStateR2.toJS();

    let expectedState2 = {
      buses: [
        {
          id: 'id1',
          name: 'Bus 1',
          containers: [
            {
              id: 'idC1',
              name: 'Container 1',
              components: [
                { id: 'idComp1', name: 'Component 1', isFolded: true },
                { id: 'idComp2', name: 'Component 2', isFolded: true }
              ]
            },
            { id: 'idC2', name: 'Container 2', components: [] }
          ]
        },
        { id: 'id2', name: 'Bus 2', containers: [] }
      ]
    };

    expect(nextState2).toEqual(jasmine.objectContaining(expectedState2));

    // 3 : bad ID
    let nextStateR3: IWorkspaceRecord = WorkspaceReducer(nextStateR2, {
      type: WorkspaceActions.TOGGLE_FOLD_COMPONENT,
      payload: { idBus: 'some random id' }
    });

    expect(nextState2).toEqual(nextStateR3.toJS());
  });

  // (UN)FOLD_COMPONENT
  it(`${UserActions.USR_IS_DISCONNECTED}`, () => {
    let nextStateR: IWorkspaceRecord = WorkspaceReducer(stateR, { type: UserActions.USR_IS_DISCONNECTED });
    let nextState = nextStateR.toJS();

    expect(workspaceRecordFactory().toJS()).toEqual(nextState);
  });

  xit(`${WorkspaceActions.UPDATE_SERVICE_UNIT_STATE}`, () => {
    // TODO (after refactor to flatten our store)
  });

  xit(`${WorkspaceActions.UPDATE_SERVICE_UNIT_STATE_SUCCESS}`, () => {
    // TODO (after refactor to flatten our store)
  });

  xit(`${WorkspaceActions.UPDATE_SERVICE_UNIT_STATE_FAILED}`, () => {
    // TODO (after refactor to flatten our store)
  });

  // TODO: Test selector
});
