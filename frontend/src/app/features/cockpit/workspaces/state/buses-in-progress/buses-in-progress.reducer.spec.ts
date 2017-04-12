/**
 * Copyright (C) 2017 Linagora
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

import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';
import { type } from 'app/shared/helpers/shared.helper';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { busesInProgressTableFactory } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.initial-state';

describe(`Buses in progress reducer`, () => {
  it(`should have a default value`, () => {
    expect(BusesInProgress.reducer(undefined, { type: `init`, payload: `` }))
      .toEqual({
        selectedBusInProgressId: '',
        isImportingBus: false,
        importBusError: '',
        importBusId: '',
        byId: {},
        allIds: []
      });
  });

  describe(type(BusesInProgress.FETCH_BUSES_IN_PROGRESS), () => {
    it(`should check action name`, () => {
      expect(BusesInProgress.FETCH_BUSES_IN_PROGRESS).toEqual(`BUSES_IN_PROGRESS_REDUCER_FETCH_BUSES_IN_PROGRESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idBus1: {
          doNotKeepPreviousValuesIfUpdate: '',
          id: 'idBus1',
          ip: '192.168.0.1',
          port: 7701,
          username: 'petals1'
        },
        idBus2: {
          doNotKeepPreviousValuesIfUpdate: '',
          id: 'idBus2',
          ip: '192.168.0.2',
          port: 7702,
          username: 'petals2'
        }
      },
      allIds: ['idBus1', 'idBus2']
    };

    it(`should add a bus if doesn't exists yet`, () => {
      const reducer = BusesInProgress.reducer(initialState, {
        type: BusesInProgress.FETCH_BUSES_IN_PROGRESS,
        payload: {
          byId: {
            idBus3: {
              id: 'idBus3',
              ip: '192.168.0.3',
              port: 7703,
              username: 'petals3'
            },
            idBus4: {
              id: 'idBus4',
              ip: '192.168.0.4',
              port: 7704,
              username: 'petals4'
            }
          },
          allIds: [
            'idBus3',
            'idBus4'
          ]
        }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            doNotKeepPreviousValuesIfUpdate: '',
            id: 'idBus1',
            ip: '192.168.0.1',
            port: 7701,
            username: 'petals1'
          },
          idBus2: {
            doNotKeepPreviousValuesIfUpdate: '',
            id: 'idBus2',
            ip: '192.168.0.2',
            port: 7702,
            username: 'petals2'
          },
          idBus3: {
            id: 'idBus3',
            ip: '192.168.0.3',
            port: 7703,
            username: 'petals3'
          },
          idBus4: {
            id: 'idBus4',
            ip: '192.168.0.4',
            port: 7704,
            username: 'petals4'
          }
        },
        allIds: ['idBus1', 'idBus2', 'idBus3', 'idBus4']
      });
    });

    it(`should replace a bus if already exists`, () => {
      const reducer = BusesInProgress.reducer(initialState, {
        type: BusesInProgress.FETCH_BUSES_IN_PROGRESS,
        payload: {
          byId: {
            idBus1: {
              id: 'idBus1',
              ip: '192.168.0.10',
              port: 7711,
              username: 'petals1 updated'
            },
            idBus2: {
              id: 'idBus2',
              ip: '192.168.0.2',
              port: 7712,
              username: 'petals2 updated'
            }
          },
          allIds: [
            'idBus1',
            'idBus2'
          ]
        }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            id: 'idBus1',
            ip: '192.168.0.10',
            port: 7711,
            username: 'petals1 updated'
          },
          idBus2: {
            id: 'idBus2',
            ip: '192.168.0.2',
            port: 7712,
            username: 'petals2 updated'
          }
        },
        allIds: ['idBus1', 'idBus2']
      });
    });
  });

  describe(type(BusesInProgress.SET_CURRENT_BUS_IN_PROGRESS), () => {
    it(`should check action name`, () => {
      expect(BusesInProgress.SET_CURRENT_BUS_IN_PROGRESS).toEqual(`BUSES_IN_PROGRESS_REDUCER_SET_CURRENT_BUS_IN_PROGRESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusInProgressId: 'idBusInProgress1',
      isImportingBus: true,
      importBusError: 'maybe',
      importBusId: 'someIdBus',
      byId: {
        keepPreviousValues: ''
      },
      allIds: []
    };

    it(`should return the same object if previous current bus in progress is the same as the new one`, () => {
      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.SET_CURRENT_BUS_IN_PROGRESS,
        payload: { busInProgressId: 'idBusInProgress1' }
      })).toBe(initialState);
    });

    it(`should reset variables related to a bus in import and set the ID of the new bus`, () => {
      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.SET_CURRENT_BUS_IN_PROGRESS,
        payload: { busInProgressId: 'idBusInProgress2' }
      })).toEqual({
        keepPreviousValues: '',
        selectedBusInProgressId: 'idBusInProgress2',
        isImportingBus: false,
        importBusError: '',
        importBusId: '',
        byId: { keepPreviousValues: '' },
        allIds: []
      });
    });
  });

  describe(type(BusesInProgress.POST_BUS_IN_PROGRESS), () => {
    it(`should check action name`, () => {
      expect(BusesInProgress.POST_BUS_IN_PROGRESS).toEqual(`BUSES_IN_PROGRESS_REDUCER_POST_BUS_IN_PROGRESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isImportingBus: false,
      importBusError: 'maybe',
      importBusId: 'someIdBus',
      byId: { keepPreviousValues: '' },
      allIds: []
    };

    it(`should update variable about bus import`, () => {
      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.POST_BUS_IN_PROGRESS,
        payload: { noMatter: 'the payload' }
      })).toEqual({
        keepPreviousValues: '',
        isImportingBus: true,
        importBusError: '',
        importBusId: '',
        byId: { keepPreviousValues: '' },
        allIds: []
      });
    });
  });

  describe(type(BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS).toEqual(`BUSES_IN_PROGRESS_REDUCER_POST_BUS_IN_PROGRESS_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      isImportingBus: true,
      importBusError: '',
      importBusId: '',
      byId: { keepPreviousValues: '' },
      allIds: []
    };

    it(`should update variable about bus import`, () => {
      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS,
        payload: {
          id: 'idBus5',
          ip: '192.168.0.1',
          port: '7700',
          username: 'admin',
          password: 'admin',
          passphrase: 'supersecretpassphrase'
        }
      })).toEqual({
        keepPreviousValues: '',
        isImportingBus: true,
        importBusError: '',
        importBusId: 'idBus5',
        byId: { keepPreviousValues: '' },
        allIds: []
      });
    });
  });

  describe(type(BusesInProgress.POST_BUS_IN_PROGRESS_ERROR), () => {
    it(`should check action name`, () => {
      expect(BusesInProgress.POST_BUS_IN_PROGRESS_ERROR).toEqual(`BUSES_IN_PROGRESS_REDUCER_POST_BUS_IN_PROGRESS_ERROR`);
    });

    it(`should return the same object if we're currently importing a bus`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        isImportingBus: true,
        importBusError: '',
        importBusId: 'someBusId',
        byId: { keepPreviousValues: '' },
        allIds: []
      };

      const reducer = BusesInProgress.reducer(initialState, {
        type: BusesInProgress.POST_BUS_IN_PROGRESS_ERROR,
        payload: 'some error'
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        isImportingBus: false,
        importBusError: 'some error',
        importBusId: '',
        byId: { keepPreviousValues: '' },
        allIds: []
      });
    });

    it(`should set correct variables if we're not currently importing a bus`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        isImportingBus: false,
        importBusError: '',
        importBusId: 'someBusId',
        byId: { keepPreviousValues: '' },
        allIds: []
      };

      const reducer = BusesInProgress.reducer(initialState, {
        type: BusesInProgress.POST_BUS_IN_PROGRESS_ERROR
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        isImportingBus: false,
        importBusError: '',
        importBusId: 'someBusId',
        byId: { keepPreviousValues: '' },
        allIds: []
      });
    });
  });

  describe(type(BusesInProgress.DELETE_BUS_IN_PROGRESS), () => {
    it(`should check action name`, () => {
      expect(BusesInProgress.DELETE_BUS_IN_PROGRESS).toEqual(`BUSES_IN_PROGRESS_REDUCER_DELETE_BUS_IN_PROGRESS`);
    });

    it(`should return the same object if the bus doesn't exists`, () => {
      const initialState: any = {
        byId: {},
        allIds: []
      };
      const reducer = BusesInProgress.reducer(initialState, {
        type: BusesInProgress.DELETE_BUS_IN_PROGRESS,
        payload: { id: 'idBus1' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should set the flag isRemoving on an existing bus`, () => {
      const initialState1: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: { keepPreviousValues: '' }
        },
        allIds: ['idBus1']
      };

      const reducer1 = BusesInProgress.reducer(initialState1, {
        type: BusesInProgress.DELETE_BUS_IN_PROGRESS,
        payload: { id: 'idBus1' }
      });

      expect(reducer1).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            keepPreviousValues: '',
            isRemoving: true
          }
        },
        allIds: ['idBus1']
      });

      // -----------------------------

      const initialState2: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            keepPreviousValues: '',
            isRemoving: false
          },
          idBus2: { keepPreviousValues: '' }
        },
        allIds: ['idBus1', 'idBus2']
      };

      const reducer2 = BusesInProgress.reducer(initialState2, {
        type: BusesInProgress.DELETE_BUS_IN_PROGRESS,
        payload: { id: 'idBus1' }
      });

      expect(reducer2).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            keepPreviousValues: '',
            isRemoving: true
          },
          idBus2: { keepPreviousValues: '' }
        },
        allIds: ['idBus1', 'idBus2']
      });
    });
  });

  describe(type(BusesInProgress.REMOVE_BUS_IN_PROGRESS), () => {
    it(`should check action name`, () => {
      expect(BusesInProgress.REMOVE_BUS_IN_PROGRESS).toEqual(`BUSES_IN_PROGRESS_REDUCER_REMOVE_BUS_IN_PROGRESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idBus1: { keepPreviousValues: '' },
        idBus2: { keepPreviousValues: '' },
        idBus3: { keepPreviousValues: '' }
      },
      allIds: ['idBus1', 'idBus2', 'idBus3']
    };

    it(`should return the same object if the bus doesn't exists`, () => {
      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.REMOVE_BUS_IN_PROGRESS,
        payload: 'unknownId'
      })).toBe(initialState);
    });

    it(`should remove an existing bus`, () => {
      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.REMOVE_BUS_IN_PROGRESS,
        payload: 'idBus1'
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus2: { keepPreviousValues: '' },
          idBus3: { keepPreviousValues: '' }
        },
        allIds: ['idBus2', 'idBus3']
      });

      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.REMOVE_BUS_IN_PROGRESS,
        payload: 'idBus2'
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: { keepPreviousValues: '' },
          idBus3: { keepPreviousValues: '' }
        },
        allIds: ['idBus1', 'idBus3']
      });

      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.REMOVE_BUS_IN_PROGRESS,
        payload: 'idBus3'
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: { keepPreviousValues: '' },
          idBus2: { keepPreviousValues: '' }
        },
        allIds: ['idBus1', 'idBus2']
      });
    });
  });

  describe(type(BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS), () => {
    it(`should check action name`, () => {
      expect(BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS).toEqual(`BUSES_IN_PROGRESS_REDUCER_UPDATE_ERROR_BUS_IN_PROGRESS`);
    });

    it(`should return the same object if bus doesn't exists`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: { keepPreviousValues: '' },
          idBus2: { keepPreviousValues: '' }
        },
        allIds: ['idBus1', 'idBus2']
      };

      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS,
        payload: { id: 'unknownId' }
      })).toBe(initialState);
    });

    it(`should update a bus import error if bus exists`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            keepPreviousValues: '',
            importError: 'random error'
          },
          idBus2: { keepPreviousValues: '' }
        },
        allIds: ['idBus1', 'idBus2']
      };

      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS,
        payload: { id: 'idBus1', importError: 'new error' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            keepPreviousValues: '',
            importError: 'new error'
          },
          idBus2: { keepPreviousValues: '' }
        },
        allIds: ['idBus1', 'idBus2']
      });

      expect(BusesInProgress.reducer(initialState, {
        type: BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS,
        payload: { id: 'idBus2', importError: 'new error' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            keepPreviousValues: '',
            importError: 'random error'
          },
          idBus2: {
            keepPreviousValues: '',
            importError: 'new error'
          }
        },
        allIds: ['idBus1', 'idBus2']
      });
    });
  });

  describe(type(Workspaces.CLEAN_WORKSPACE), () => {
    it(`should return the initial state`, () => {
      const initialState: any = {
        noMatter: 'the state'
      };

      expect(BusesInProgress.reducer(initialState, {
        type: Workspaces.CLEAN_WORKSPACE
      })).toEqual(busesInProgressTableFactory());
    });
  });
});
