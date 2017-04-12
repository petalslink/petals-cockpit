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

import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.reducer';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { busesTableFactory } from 'app/features/cockpit/workspaces/state/buses/buses.initial-state';
import { type } from 'app/shared/helpers/shared.helper';

describe(`Buses reducer`, () => {
  it(`should have a default value`, () => {
    expect(Buses.reducer(undefined, { type: `init`, payload: `` }))
      .toEqual({
        selectedBusId: '',
        byId: {},
        allIds: []
      });
  });

  describe(type(Buses.FETCH_BUSES_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Buses.FETCH_BUSES_SUCCESS).toEqual(`BUSES_REDUCER_FETCH_BUSES_SUCCESS`);
    });

    it(`should add one bus`, () => {
      const reducer = Buses.reducer(undefined, {
        type: Buses.FETCH_BUSES_SUCCESS,
        payload: {
          byId: {
            idBus0: {
              name: 'Bus 0',
              state: 'UNDEPLOYED',
              containers: ['idCont0', 'idCont1'],
              id: 'idBus0'
            }
          },
          allIds: ['idBus0']
        }
      });

      expect(reducer).toEqual({
        selectedBusId: '',
        byId: {
          idBus0: {
            name: 'Bus 0',
            state: 'UNDEPLOYED',
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0'
          }
        },
        allIds: ['idBus0']
      });
    });

    it(`should add a second bus after the previous one`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            name: 'Bus 0',
            state: 'UNDEPLOYED',
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0'
          }
        },
        allIds: ['idBus0']
      };

      const reducer = Buses.reducer(initialState, {
        type: Buses.FETCH_BUSES_SUCCESS,
        payload: {
          byId: {
            idBus1: {
              name: 'Bus 1',
              state: 'UNDEPLOYED',
              containers: ['idCont2', 'idCont3'],
              id: 'idBus1'
            }
          },
          allIds: ['idBus1']
        }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            name: 'Bus 0',
            state: 'UNDEPLOYED',
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0'
          },
          idBus1: {
            name: 'Bus 1',
            state: 'UNDEPLOYED',
            containers: ['idCont2', 'idCont3'],
            id: 'idBus1'
          }
        },
        allIds: ['idBus0', 'idBus1']
      });
    });

    it(`should replace an existing bus`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            name: 'Bus 0',
            state: 'UNDEPLOYED',
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0'
          },
          idBus1: {
            doNotKeepPreviousValuesIfUpdate: '',
            name: 'Bus 1',
            state: 'UNDEPLOYED',
            containers: ['idCont2', 'idCont3'],
            id: 'idBus1'
          }
        },
        allIds: ['idBus0', 'idBus1']
      };

      const reducer = Buses.reducer(initialState, {
        type: Buses.FETCH_BUSES_SUCCESS,
        payload: {
          byId: {
            idBus1: {
              name: 'Bus 1, updated name',
              state: 'DEPLOYED',
              containers: ['idCont2-updated', 'idCont3-updated'],
              id: 'idBus1'
            }
          },
          allIds: ['idBus1']
        }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            name: 'Bus 0',
            state: 'UNDEPLOYED',
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0'
          },
          idBus1: {
            name: 'Bus 1, updated name',
            state: 'DEPLOYED',
            containers: ['idCont2-updated', 'idCont3-updated'],
            id: 'idBus1'
          }
        },
        allIds: ['idBus0', 'idBus1']
      });
    });
  });

  describe(type(Buses.FOLD_BUS), () => {
    it(`should check action name`, () => {
      expect(Buses.FOLD_BUS).toEqual(`BUSES_REDUCER_FOLD_BUS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isFolded: false
        }
      },
      allIds: ['idBus0']
    };

    it(`should return the same object if ID doesn't exists`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.FOLD_BUS,
        payload: { busId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should fold an existing bus`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.FOLD_BUS,
        payload: { busId: 'idBus0' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idBus0']
      });
    });

    it(`should return the same object when trying to fold a bus already folded`, () => {
      const initialState2: any = {
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idBus0']
      };

      const reducer = Buses.reducer(initialState2, {
        type: Buses.FOLD_BUS,
        payload: { busId: 'idBus0' }
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(type(Buses.UNFOLD_BUS), () => {
    it(`should check action name`, () => {
      expect(Buses.UNFOLD_BUS).toEqual(`BUSES_REDUCER_UNFOLD_BUS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isFolded: true
        }
      },
      allIds: ['idBus0']
    };

    it(`should return the same object when trying to unfold an unknown bus`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.UNFOLD_BUS,
        payload: { busId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should unfold an existing bus`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.UNFOLD_BUS,
        payload: { busId: 'idBus0' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idBus0']
      });
    });

    it(`should return the same object when trying to unfold an already unfolded bus`, () => {
      const initialState2: any = {
        selectedBusId: '',
        byId: {
          idBus0: { isFolded: false }
        },
        allIds: ['idBus0']
      };

      const reducer = Buses.reducer(initialState2, {
        type: Buses.UNFOLD_BUS,
        payload: { busId: 'idBus0' }
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(type(Buses.TOGGLE_FOLD_BUS), () => {
    it(`should check action name`, () => {
      expect(Buses.TOGGLE_FOLD_BUS).toEqual(`BUSES_REDUCER_TOGGLE_FOLD_BUS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isFolded: true
        }
      },
      allIds: ['idBus0']
    };

    it(`should return the same object when trying to toggle an unknown ID`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.TOGGLE_FOLD_BUS,
        payload: { busId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should toggle from true to false`, () => {
      const reducer2 = Buses.reducer(initialState, {
        type: Buses.TOGGLE_FOLD_BUS,
        payload: { busId: 'idBus0' }
      });

      expect(reducer2).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idBus0']
      });
    });

    it(`should toggle from false to true`, () => {
      const initialState2: any = {
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idBus0']
      };

      const reducer = Buses.reducer(initialState2, {
        type: Buses.TOGGLE_FOLD_BUS,
        payload: { busId: 'idBus0' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idBus0']
      });
    });
  });

  describe(type(Buses.SET_CURRENT_BUS), () => {
    it(`should check action name`, () => {
      expect(Buses.SET_CURRENT_BUS).toEqual(`BUSES_REDUCER_SET_CURRENT_BUS`);
    });

    it(`should set the current bus`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedBusId: '',
      };

      // setting the current bus to an unknown bus (so far) should work
      // because we'll be trying to fetch that bus right after
      const reducer = Buses.reducer(initialState, {
        type: Buses.SET_CURRENT_BUS,
        payload: { busId: 'unknown' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: 'unknown'
      });
    });
  });

  describe(type(Buses.REMOVE_BUS), () => {
    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          isFolded: true,
          keepPreviousValues: '',
        },
        idBus1: {
          isFolded: true,
          keepPreviousValues: '',
        },
        idBus2: {
          isFolded: true,
          keepPreviousValues: '',
        }
      },
      allIds: ['idBus0', 'idBus1', 'idBus2']
    };

    it(`should check action name`, () => {
      expect(Buses.REMOVE_BUS).toEqual(`BUSES_REDUCER_REMOVE_BUS`);
    });

    it(`should return the same object when trying to remove unknow ID`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.REMOVE_BUS,
        payload: { busId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should remove the first bus`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.REMOVE_BUS,
        payload: { busId: 'idBus0' }
      })).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            keepPreviousValues: '',
            isFolded: true
          },
          idBus2: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idBus1', 'idBus2']
      });
    });

    it(`should remove the second bus`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.REMOVE_BUS,
        payload: { busId: 'idBus1' }
      })).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true
          },
          idBus2: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idBus0', 'idBus2']
      });
    });

    it(`should remove the third bus`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.REMOVE_BUS,
        payload: { busId: 'idBus2' }
      })).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true
          },
          idBus1: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idBus0', 'idBus1']
      });
    });
  });

  describe(type(Buses.FETCH_BUS_DETAILS), () => {
    it(`should check action name`, () => {
      expect(Buses.FETCH_BUS_DETAILS).toEqual(`BUSES_REDUCER_FETCH_BUS_DETAILS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idBus0']
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.FETCH_BUS_DETAILS,
        payload: { busId: 'idBus0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFetchingDetails: true
          }
        },
        allIds: ['idBus0']
      });
    });

    it(`should add the bus if he doesn't exists yet`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.FETCH_BUS_DETAILS,
        payload: { busId: 'idNewBus' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: ''
          },
          idNewBus: { isFetchingDetails: true }
        },
        allIds: ['idBus0', 'idNewBus']
      });
    });
  });

  describe(type(Buses.FETCH_BUS_DETAILS_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Buses.FETCH_BUS_DETAILS_SUCCESS).toEqual(`BUSES_REDUCER_FETCH_BUS_DETAILS_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idBus0']
    };

    it(`should set isFetchingDetails to false even if isFetchingDetails doesn't exists yet`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.FETCH_BUS_DETAILS_SUCCESS,
        payload: { busId: 'idBus0', data: { someData: 'some data' } }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
            someData: 'some data'
          }
        },
        allIds: ['idBus0']
      });
    });

    it(`should add the bus if he doesn't exists yet`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.FETCH_BUS_DETAILS_SUCCESS,
        payload: { busId: 'idNewBus', data: { someData: 'some data' } }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: ''
          },
          idNewBus: {
            isFetchingDetails: false,
            someData: 'some data'
          }
        },
        allIds: ['idBus0', 'idNewBus']
      });
    });
  });

  describe(type(Buses.FETCH_BUS_DETAILS_ERROR), () => {
    it(`should check action name`, () => {
      expect(Buses.FETCH_BUS_DETAILS_ERROR).toEqual(`BUSES_REDUCER_FETCH_BUS_DETAILS_ERROR`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isFetchingDetails: true
        }
      },
      allIds: ['idBus0']
    };

    it(`should set isFetchingDetails to false if the bus exists`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.FETCH_BUS_DETAILS_ERROR,
        payload: { busId: 'idBus0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFetchingDetails: false
          }
        },
        allIds: ['idBus0']
      });
    });

    it(`should return the same object if ID is unknown`, () => {
      expect(Buses.reducer(initialState, {
        type: Buses.FETCH_BUS_DETAILS_ERROR,
        payload: { busId: 'idNewBus' }
      })).toBe(initialState);
    });
  });

  describe(type(Workspaces.CLEAN_WORKSPACE), () => {
    it(`should return the initial value to reset the workspace`, () => {
      const initialState: any = {
        doNotKeepPreviousValues: '',
        byId: {
          doNotKeepPreviousValues: '',
          idBus0: { isFetchingDetails: true }
        },
        allIds: ['idBus0']
      };

      expect(Buses.reducer(undefined, { type: Workspaces.CLEAN_WORKSPACE, payload: { noMatter: 'which payload !' } }))
        .toEqual(busesTableFactory());

      expect(Buses.reducer(initialState, { type: Workspaces.CLEAN_WORKSPACE, payload: { noMatter: 'which payload !' } }))
        .toEqual(busesTableFactory());
    });
  });
});
