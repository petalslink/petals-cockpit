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

import { busesTableFactory } from './buses.interface';
import { Buses } from './buses.reducer';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';

describe(`Buses reducer`, () => {
  it(`should have a default value`, () => {
    expect(Buses.reducer(undefined, { type: `init`, payload: `` })).toEqual({
      selectedBusId: '',
      byId: {},
      allIds: [],
    });
  });

  describe(Buses.FETCH_BUSES_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Buses.FETCH_BUSES_SUCCESS).toEqual(`[Buses] Fetch buses success`);
    });

    it(`should add one bus`, () => {
      const reducer = Buses.reducer(undefined, {
        type: Buses.FETCH_BUSES_SUCCESS,
        payload: {
          byId: {
            idBus0: {
              name: 'Bus 0',
              containers: ['idCont0', 'idCont1'],
              id: 'idBus0',
              workspaceId: 'wsId0',
            },
          },
          allIds: ['idBus0'],
        },
      });

      expect(reducer).toEqual({
        selectedBusId: '',
        byId: {
          idBus0: {
            name: 'Bus 0',
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0',
            workspaceId: 'wsId0',
            isFolded: false,
            isFetchingDetails: false,
          },
        },
        allIds: ['idBus0'],
      });
    });

    it(`should replace existing buses while keeping extra values`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          doNotKeepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            name: 'Bus 0',
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0',
            isFolded: false,
            isFetchingDetails: false,
          },
          idBus1: {
            keepPreviousValues: '',
            name: 'Bus 1',
            containers: ['idCont2', 'idCont3'],
            id: 'idBus1',
            isFolded: false,
            isFetchingDetails: false,
          },
        },
        allIds: ['idBus0', 'idBus1'],
      };

      const reducer = Buses.reducer(initialState, {
        type: Buses.FETCH_BUSES_SUCCESS,
        payload: {
          byId: {
            idBus1: {
              name: 'Bus 1, updated name',
              containers: ['idCont2-updated', 'idCont3-updated'],
              id: 'idBus1',
              workspaceId: 'wsId0',
            },
          },
          allIds: ['idBus1'],
        },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          idBus1: {
            keepPreviousValues: '',
            name: 'Bus 1, updated name',
            containers: ['idCont2-updated', 'idCont3-updated'],
            id: 'idBus1',
            workspaceId: 'wsId0',
            isFolded: false,
            isFetchingDetails: false,
          },
        },
        allIds: ['idBus1'],
      });
    });
  });

  describe(Buses.ADD_BUSES_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Buses.ADD_BUSES_SUCCESS).toEqual(`[Buses] Add buses success`);
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
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0',
            workspaceId: 'wsId0',
            isFolded: false,
            isFetchingDetails: false,
          },
        },
        allIds: ['idBus0'],
      };

      const reducer = Buses.reducer(initialState, {
        type: Buses.ADD_BUSES_SUCCESS,
        payload: {
          byId: {
            idBus1: {
              name: 'Bus 1',
              containers: ['idCont2', 'idCont3'],
              id: 'idBus1',
              workspaceId: 'wsId0',
            },
          },
          allIds: ['idBus1'],
        },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            name: 'Bus 0',
            containers: ['idCont0', 'idCont1'],
            id: 'idBus0',
            workspaceId: 'wsId0',
            isFolded: false,
            isFetchingDetails: false,
          },
          idBus1: {
            name: 'Bus 1',
            containers: ['idCont2', 'idCont3'],
            id: 'idBus1',
            workspaceId: 'wsId0',
            isFolded: false,
            isFetchingDetails: false,
          },
        },
        allIds: ['idBus0', 'idBus1'],
      });
    });
  });

  describe(Buses.FOLD_BUS, () => {
    it(`should check action name`, () => {
      expect(Buses.FOLD_BUS).toEqual(`[Buses] Fold bus`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isFolded: false,
        },
      },
      allIds: ['idBus0'],
    };

    it(`should return the same object if ID doesn't exists`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.FOLD_BUS,
        payload: { busId: 'unknown' },
      });

      expect(reducer).toBe(initialState);
    });

    it(`should fold an existing bus`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.FOLD_BUS,
        payload: { busId: 'idBus0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true,
          },
        },
        allIds: ['idBus0'],
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
            isFolded: true,
          },
        },
        allIds: ['idBus0'],
      };

      const reducer = Buses.reducer(initialState2, {
        type: Buses.FOLD_BUS,
        payload: { busId: 'idBus0' },
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(Buses.UNFOLD_BUS, () => {
    it(`should check action name`, () => {
      expect(Buses.UNFOLD_BUS).toEqual(`[Buses] Unfold bus`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isFolded: true,
        },
      },
      allIds: ['idBus0'],
    };

    it(`should return the same object when trying to unfold an unknown bus`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.UNFOLD_BUS,
        payload: { busId: 'unknown' },
      });

      expect(reducer).toBe(initialState);
    });

    it(`should unfold an existing bus`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.UNFOLD_BUS,
        payload: { busId: 'idBus0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: false,
          },
        },
        allIds: ['idBus0'],
      });
    });

    it(`should return the same object when trying to unfold an already unfolded bus`, () => {
      const initialState2: any = {
        selectedBusId: '',
        byId: {
          idBus0: { isFolded: false },
        },
        allIds: ['idBus0'],
      };

      const reducer = Buses.reducer(initialState2, {
        type: Buses.UNFOLD_BUS,
        payload: { busId: 'idBus0' },
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(Buses.TOGGLE_FOLD_BUS, () => {
    it(`should check action name`, () => {
      expect(Buses.TOGGLE_FOLD_BUS).toEqual(`[Buses] Toggle fold bus`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isFolded: true,
        },
      },
      allIds: ['idBus0'],
    };

    it(`should return the same object when trying to toggle an unknown ID`, () => {
      const reducer = Buses.reducer(initialState, {
        type: Buses.TOGGLE_FOLD_BUS,
        payload: { busId: 'unknown' },
      });

      expect(reducer).toBe(initialState);
    });

    it(`should toggle from true to false`, () => {
      const reducer2 = Buses.reducer(initialState, {
        type: Buses.TOGGLE_FOLD_BUS,
        payload: { busId: 'idBus0' },
      });

      expect(reducer2).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: false,
          },
        },
        allIds: ['idBus0'],
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
            isFolded: false,
          },
        },
        allIds: ['idBus0'],
      };

      const reducer = Buses.reducer(initialState2, {
        type: Buses.TOGGLE_FOLD_BUS,
        payload: { busId: 'idBus0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true,
          },
        },
        allIds: ['idBus0'],
      });
    });
  });

  describe(Buses.SET_CURRENT_BUS, () => {
    it(`should check action name`, () => {
      expect(Buses.SET_CURRENT_BUS).toEqual(`[Buses] Set current bus`);
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
        payload: { busId: 'unknown' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedBusId: 'unknown',
      });
    });
  });

  describe(Buses.REMOVE_BUS, () => {
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
        },
      },
      allIds: ['idBus0', 'idBus1', 'idBus2'],
    };

    it(`should check action name`, () => {
      expect(Buses.REMOVE_BUS).toEqual(`[Buses] Remove bus`);
    });

    it(`should remove the first bus`, () => {
      expect(
        Buses.reducer(initialState, {
          type: Buses.REMOVE_BUS,
          payload: { busId: 'idBus0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus1: {
            keepPreviousValues: '',
            isFolded: true,
          },
          idBus2: {
            keepPreviousValues: '',
            isFolded: true,
          },
        },
        allIds: ['idBus1', 'idBus2'],
      });
    });

    it(`should remove the second bus`, () => {
      expect(
        Buses.reducer(initialState, {
          type: Buses.REMOVE_BUS,
          payload: { busId: 'idBus1' },
        })
      ).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true,
          },
          idBus2: {
            keepPreviousValues: '',
            isFolded: true,
          },
        },
        allIds: ['idBus0', 'idBus2'],
      });
    });

    it(`should remove the third bus`, () => {
      expect(
        Buses.reducer(initialState, {
          type: Buses.REMOVE_BUS,
          payload: { busId: 'idBus2' },
        })
      ).toEqual({
        keepPreviousValues: '',
        selectedBusId: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFolded: true,
          },
          idBus1: {
            keepPreviousValues: '',
            isFolded: true,
          },
        },
        allIds: ['idBus0', 'idBus1'],
      });
    });
  });

  describe(Buses.FETCH_BUS_DETAILS, () => {
    it(`should check action name`, () => {
      expect(Buses.FETCH_BUS_DETAILS).toEqual(`[Buses] Fetch bus details`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idBus0'],
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      expect(
        Buses.reducer(initialState, {
          type: Buses.FETCH_BUS_DETAILS,
          payload: { busId: 'idBus0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFetchingDetails: true,
          },
        },
        allIds: ['idBus0'],
      });
    });
  });

  describe(Buses.FETCH_BUS_DETAILS_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Buses.FETCH_BUS_DETAILS_SUCCESS).toEqual(
        `[Buses] Fetch bus details success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idBus0'],
    };

    it(`should set isFetchingDetails to false even if isFetchingDetails doesn't exists yet`, () => {
      expect(
        Buses.reducer(initialState, {
          type: Buses.FETCH_BUS_DETAILS_SUCCESS,
          payload: { busId: 'idBus0', data: { someData: 'some data' } },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
            someData: 'some data',
          },
        },
        allIds: ['idBus0'],
      });
    });
  });

  describe(Buses.FETCH_BUS_DETAILS_ERROR, () => {
    it(`should check action name`, () => {
      expect(Buses.FETCH_BUS_DETAILS_ERROR).toEqual(
        `[Buses] Fetch bus details error`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isFetchingDetails: true,
        },
      },
      allIds: ['idBus0'],
    };

    it(`should set isFetchingDetails to false if the bus exists`, () => {
      expect(
        Buses.reducer(initialState, {
          type: Buses.FETCH_BUS_DETAILS_ERROR,
          payload: { busId: 'idBus0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
          },
        },
        allIds: ['idBus0'],
      });
    });
  });

  describe(Workspaces.CLEAN_WORKSPACE, () => {
    it(`should return the initial value to reset the workspace`, () => {
      const initialState: any = {
        doNotKeepPreviousValues: '',
        byId: {
          doNotKeepPreviousValues: '',
          idBus0: { isFetchingDetails: true },
        },
        allIds: ['idBus0'],
      };

      expect(
        Buses.reducer(undefined, {
          type: Workspaces.CLEAN_WORKSPACE,
          payload: { noMatter: 'which payload !' },
        })
      ).toEqual(busesTableFactory());

      expect(
        Buses.reducer(initialState, {
          type: Workspaces.CLEAN_WORKSPACE,
          payload: { noMatter: 'which payload !' },
        })
      ).toEqual(busesTableFactory());
    });
  });

  describe(Buses.DELETE_BUS, () => {
    it(`should check action name`, () => {
      expect(Buses.DELETE_BUS).toEqual(`[Buses] Delete bus`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: 'idBus0',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isRemoving: false,
          isFolded: true,
        },
        idBus1: {
          keepPreviousValues: '',
          isRemoving: false,
          isFolded: true,
        },
      },
      allIds: ['idBus0', 'idBus1'],
    };

    it(`should set the isSelectedBusRemoving variable to true on the first bus`, () => {
      expect(
        Buses.reducer(initialState, {
          type: Buses.DELETE_BUS,
          payload: 'idBus0',
        })
      ).toEqual({
        keepPreviousValues: '',
        selectedBusId: 'idBus0',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isRemoving: true,
            isFolded: true,
          },
          idBus1: {
            keepPreviousValues: '',
            isRemoving: false,
            isFolded: true,
          },
        },
        allIds: ['idBus0', 'idBus1'],
      });
    });
  });

  describe(Buses.DELETE_BUS_FAILED, () => {
    it(`should check action name`, () => {
      expect(Buses.DELETE_BUS_FAILED).toEqual(`[Buses] Delete bus failed`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      selectedBusId: 'idBus0',
      byId: {
        keepPreviousValues: '',
        idBus0: {
          keepPreviousValues: '',
          isRemoving: true,
          isFolded: true,
        },
        idBus1: {
          keepPreviousValues: '',
          isRemoving: false,
          isFolded: true,
        },
      },
      allIds: ['idBus0', 'idBus1'],
    };

    it(`should set the isSelectedBusRemoving variable to false`, () => {
      expect(
        Buses.reducer(initialState, {
          type: Buses.DELETE_BUS_FAILED,
          payload: 'idBus0',
        })
      ).toEqual({
        keepPreviousValues: '',
        selectedBusId: 'idBus0',
        byId: {
          keepPreviousValues: '',
          idBus0: {
            keepPreviousValues: '',
            isRemoving: false,
            isFolded: true,
          },
          idBus1: {
            keepPreviousValues: '',
            isRemoving: false,
            isFolded: true,
          },
        },
        allIds: ['idBus0', 'idBus1'],
      });
    });
  });
});
