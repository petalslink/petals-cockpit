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

import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.reducer';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.reducer';

describe(`SharedLibraries reducer`, () => {
  it(`should have a default value`, () => {
    expect(
      SharedLibraries.reducer(undefined, { type: `init`, payload: `` })
    ).toEqual({
      selectedSharedLibraryId: '',
      isFetchingDetails: false,

      byId: {},
      allIds: [],
    });
  });

  describe(SharedLibraries.FETCHED, () => {
    it(`should check action name`, () => {
      expect(SharedLibraries.FETCHED).toEqual(`[Shared libraries] Fetched`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSl0: {
          keepPreviousValues: '',
          name: 'SL 0',
          version: '1',
          id: 'idSl0',
        },
        idSl1: {
          keepPreviousValues: '',
          name: 'SL 1',
          version: '1',
          id: 'idSl1',
        },
      },
      allIds: ['idSl0', 'idSl1'],
    };

    it(`should replace existing shared library while keeping extra values`, () => {
      expect(
        SharedLibraries.reducer(initialState, {
          type: SharedLibraries.FETCHED,
          payload: {
            byId: {
              idSl0: {
                name: 'SL 0 updated name',
                id: 'idSl0',
                containerId: 'idCont0',
              },
              idSl2: {
                name: 'SL 2',
                version: '1',
                id: 'idSl2',
                containerId: 'idCont0',
                components: ['idComp0'],
              },
            },
            allIds: ['idSl0', 'idSl2'],
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          idSl0: {
            keepPreviousValues: '',
            name: 'SL 0 updated name',
            version: '1',
            id: 'idSl0',
            containerId: 'idCont0',
            components: [],
            isFolded: false,
          },
          idSl2: {
            name: 'SL 2',
            version: '1',
            id: 'idSl2',
            containerId: 'idCont0',
            isFolded: false,
            components: ['idComp0'],
          },
        },
        allIds: ['idSl0', 'idSl2'],
      });
    });
  });

  describe(SharedLibraries.ADDED, () => {
    it(`should check action name`, () => {
      expect(SharedLibraries.ADDED).toEqual(`[Shared libraries] Added`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSl0: {
          keepPreviousValues: '',
          name: 'SL 0',
          version: '1',
          id: 'idSl0',
        },
        idSl1: {
          keepPreviousValues: '',
          name: 'SL 1',
          version: '1',
          id: 'idSl1',
        },
      },
      allIds: ['idSl0', 'idSl1'],
    };

    it(`should add new shared library without touching the others`, () => {
      expect(
        SharedLibraries.reducer(initialState, {
          type: SharedLibraries.ADDED,
          payload: {
            byId: {
              idSl2: {
                name: 'SL 2',
                version: '1',
                id: 'idSl2',
                containerId: 'idCont0',
                components: ['idComp0'],
              },
            },
            allIds: ['idSl2'],
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSl0: {
            keepPreviousValues: '',
            name: 'SL 0',
            version: '1',
            id: 'idSl0',
          },
          idSl1: {
            keepPreviousValues: '',
            name: 'SL 1',
            version: '1',
            id: 'idSl1',
          },
          idSl2: {
            name: 'SL 2',
            version: '1',
            id: 'idSl2',
            containerId: 'idCont0',
            isFolded: false,
            components: ['idComp0'],
          },
        },
        allIds: ['idSl0', 'idSl1', 'idSl2'],
      });
    });
  });

  describe(SharedLibraries.SET_CURRENT, () => {
    it(`should check action name`, () => {
      expect(SharedLibraries.SET_CURRENT).toEqual(
        `[Shared libraries] Set current`
      );
    });

    it(`should set the current shared library`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedSharedLibraryId: '',
      };

      const reducer = SharedLibraries.reducer(initialState, {
        type: SharedLibraries.SET_CURRENT,
        payload: { id: 'idSl0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedSharedLibraryId: 'idSl0',
      });
    });
  });

  describe(SharedLibraries.FETCH_DETAILS, () => {
    it(`should check action name`, () => {
      expect(SharedLibraries.FETCH_DETAILS).toEqual(
        `[Shared libraries] Fetch details`
      );
      expect(SharedLibraries.FETCH_DETAILS_ERROR).toEqual(
        `[Shared libraries] Fetch details error`
      );
      expect(SharedLibraries.FETCH_DETAILS_SUCCESS).toEqual(
        `[Shared libraries] Fetch details success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSl0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idSl0'],
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      const fetchState = SharedLibraries.reducer(initialState, {
        type: SharedLibraries.FETCH_DETAILS,
        payload: { id: 'idSl0' },
      });

      expect(fetchState).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSl0: {
            keepPreviousValues: '',
            isFetchingDetails: true,
          },
        },
        allIds: ['idSl0'],
      });

      it(`should add details on success`, () => {
        expect(
          SharedLibraries.reducer(fetchState, {
            type: SharedLibraries.FETCH_DETAILS_SUCCESS,
            payload: { id: 'idSl0', data: {} },
          })
        ).toEqual({
          keepPreviousValues: '',
          byId: {
            keepPreviousValues: '',
            idSl0: {
              keepPreviousValues: '',
              isFetchingDetails: false,
              // there is no data in details for now...
            },
          },
          allIds: ['idSl0'],
        });
      });

      it(`should set error on failure`, () => {
        expect(
          SharedLibraries.reducer(fetchState, {
            type: SharedLibraries.FETCH_DETAILS_ERROR,
            payload: { id: 'idSl0' },
          })
        ).toEqual({
          keepPreviousValues: '',
          byId: {
            keepPreviousValues: '',
            idSl0: {
              keepPreviousValues: '',
              isFetchingDetails: false,
              // there is no error stored for now...
            },
          },
          allIds: ['idSl0'],
        });
      });
    });
  });

  describe(Containers.DEPLOY_COMPONENT_SUCCESS, () => {
    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSl0: {
          keepPreviousValues: '',
          components: ['idComp0'],
        },
        idSl1: {
          keepPreviousValues: '',
          components: [],
        },
        idSl2: {
          keepPreviousValues: '',
          components: ['idComp1'],
        },
        idSl3: {
          keepPreviousValues: '',
          components: [],
        },
      },
      allIds: ['idSl0', 'idSl1', 'idSl2', 'idSl3'],
    };

    it(`should add the component to the shared libraries`, () => {
      const fetchState = SharedLibraries.reducer(initialState, {
        type: Containers.DEPLOY_COMPONENT_SUCCESS,
        payload: { id: 'idComp2', sharedLibraries: ['idSl0', 'idSl1'] },
      });

      expect(fetchState).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSl0: {
            keepPreviousValues: '',
            components: ['idComp0', 'idComp2'],
          },
          idSl1: {
            keepPreviousValues: '',
            components: ['idComp2'],
          },
          idSl2: {
            keepPreviousValues: '',
            components: ['idComp1'],
          },
          idSl3: {
            keepPreviousValues: '',
            components: [],
          },
        },
        allIds: ['idSl0', 'idSl1', 'idSl2', 'idSl3'],
      });
    });
  });

  describe(Components.REMOVE_COMPONENT, () => {
    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSl0: {
          keepPreviousValues: '',
          components: ['idComp0', 'idComp2'],
        },
        idSl1: {
          keepPreviousValues: '',
          components: ['idComp2'],
        },
        idSl2: {
          keepPreviousValues: '',
          components: ['idComp0'],
        },
        idSl3: {
          keepPreviousValues: '',
          components: [],
        },
      },
      allIds: ['idSl0', 'idSl1', 'idSl2', 'idSl3'],
    };

    it(`should remove the component from the shared libraries`, () => {
      const fetchState = SharedLibraries.reducer(initialState, {
        type: Components.REMOVE_COMPONENT,
        payload: {
          id: 'idComp0',
          sharedLibraries: ['idSl0', 'idSl2'],
        },
      });

      expect(fetchState).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSl0: {
            keepPreviousValues: '',
            components: ['idComp2'],
          },
          idSl1: {
            keepPreviousValues: '',
            components: ['idComp2'],
          },
          idSl2: {
            keepPreviousValues: '',
            components: [],
          },
          idSl3: {
            keepPreviousValues: '',
            components: [],
          },
        },
        allIds: ['idSl0', 'idSl1', 'idSl2', 'idSl3'],
      });
    });
  });
});
