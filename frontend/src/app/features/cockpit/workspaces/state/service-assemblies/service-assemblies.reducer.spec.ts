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

import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { serviceAssembliesTableFactory } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';

describe(`ServiceAssemblies reducer`, () => {
  it(`should have a default value`, () => {
    expect(
      ServiceAssemblies.reducer(undefined, { type: `init`, payload: `` })
    ).toEqual({
      selectedServiceAssemblyId: '',
      isFetchingDetails: false,

      byId: {},
      allIds: [],
    });
  });

  describe(ServiceAssemblies.FETCH_SERVICE_ASSEMBLIES_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.FETCH_SERVICE_ASSEMBLIES_SUCCESS).toEqual(
        `[Service assemblies] Fetch service assemblies success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSa0: {
          keepPreviousValues: '',
          name: 'SA 0',
          id: 'idSa0',
        },
        idSa1: {
          keepPreviousValues: '',
          name: 'SA 1',
          id: 'idSa1',
        },
      },
      allIds: ['idSa0', 'idSa1'],
    };

    it(`should replace existing service assembly while keeping extra values`, () => {
      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.FETCH_SERVICE_ASSEMBLIES_SUCCESS,
          payload: {
            byId: {
              idSa0: {
                name: 'SA 0 updated name',
                id: 'idSa0',
                containerId: 'idCont0',
                serviceUnits: ['idSu0'],
                state: 'Loaded',
              },
              idSa2: {
                name: 'SA 2',
                id: 'idSa2',
                containerId: 'idCont0',
                serviceUnits: ['idSu1'],
                state: 'Loaded',
              },
            },
            allIds: ['idSa0', 'idSa2'],
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          idSa0: {
            keepPreviousValues: '',
            name: 'SA 0 updated name',
            id: 'idSa0',
            containerId: 'idCont0',
            serviceUnits: ['idSu0'],
            state: 'Loaded',
            isFolded: false,
            isUpdatingState: false,
            errorChangeState: '',
          },
          idSa2: {
            name: 'SA 2',
            id: 'idSa2',
            containerId: 'idCont0',
            serviceUnits: ['idSu1'],
            state: 'Loaded',
            isFolded: false,
            isUpdatingState: false,
            errorChangeState: '',
          },
        },
        allIds: ['idSa0', 'idSa2'],
      });
    });
  });

  describe(ServiceAssemblies.ADD_SERVICE_ASSEMBLIES_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.ADD_SERVICE_ASSEMBLIES_SUCCESS).toEqual(
        `[Service assemblies] Add service assemblies success`
      );
    });

    it(`should add a service-assembly if doesn't exists yet`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
            name: 'SA 0',
            id: 'idSa0',
          },
          idSa1: {
            keepPreviousValues: '',
            name: 'SA 1',
            id: 'idSa1',
          },
        },
        allIds: ['idSa0', 'idSa1'],
      };

      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.ADD_SERVICE_ASSEMBLIES_SUCCESS,
          payload: {
            byId: {
              idSa2: {
                name: 'SA 2',
                id: 'idSa2',
                containerId: 'idCont0',
                state: 'Loaded',
              },
              idSa3: {
                name: 'SA 3',
                id: 'idSa3',
                containerId: 'idCont0',
                state: 'Loaded',
              },
            },
            allIds: ['idSa2', 'idSa3'],
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
            name: 'SA 0',
            id: 'idSa0',
          },
          idSa1: {
            keepPreviousValues: '',
            name: 'SA 1',
            id: 'idSa1',
          },
          idSa2: {
            name: 'SA 2',
            id: 'idSa2',
            containerId: 'idCont0',
            serviceUnits: [],
            state: 'Loaded',
            isFolded: false,
            isUpdatingState: false,
            errorChangeState: '',
          },
          idSa3: {
            name: 'SA 3',
            id: 'idSa3',
            containerId: 'idCont0',
            serviceUnits: [],
            state: 'Loaded',
            isFolded: false,
            isUpdatingState: false,
            errorChangeState: '',
          },
        },
        allIds: ['idSa0', 'idSa1', 'idSa2', 'idSa3'],
      });
    });
  });

  describe(ServiceAssemblies.SET_CURRENT_SERVICE_ASSEMBLY, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.SET_CURRENT_SERVICE_ASSEMBLY).toEqual(
        `[Service assemblies] Set current service assembly`
      );
    });

    it(`should set the current service-assembly and reset its errors`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedServiceAssemblyId: '',
        byId: {
          idSa0: { errorChangeState: 'some error' },
        },
        allIds: ['idSa0'],
      };

      const reducer = ServiceAssemblies.reducer(initialState, {
        type: ServiceAssemblies.SET_CURRENT_SERVICE_ASSEMBLY,
        payload: { serviceAssemblyId: 'idSa0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedServiceAssemblyId: 'idSa0',
        byId: {
          idSa0: { errorChangeState: '' },
        },
        allIds: ['idSa0'],
      });
    });
  });

  describe(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS).toEqual(
        `[Service assemblies] Fetch service assembly details`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSa0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idSa0'],
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS,
          payload: { serviceAssemblyId: 'idSa0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
            isFetchingDetails: true,
          },
        },
        allIds: ['idSa0'],
      });
    });
  });

  describe(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_SUCCESS).toEqual(
        `[Service assemblies] Fetch service assembly details success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSa0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idSa0'],
    };

    it(`should set isFetchingDetails to false even if isFetchingDetails doesn't exists yet`, () => {
      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_SUCCESS,
          payload: {
            serviceAssemblyId: 'idSa0',
            data: { someData: 'some data' },
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
            someData: 'some data',
          },
        },
        allIds: ['idSa0'],
      });
    });
  });

  describe(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_ERROR, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_ERROR).toEqual(
        `[Service assemblies] Fetch service assembly details error`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSa0: {
          keepPreviousValues: '',
          isFetchingDetails: true,
        },
      },
      allIds: ['idSa0'],
    };

    it(`should set isFetchingDetails to false if the service-assembly exists`, () => {
      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_ERROR,
          payload: { serviceAssemblyId: 'idSa0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
          },
        },
        allIds: ['idSa0'],
      });
    });
  });

  describe(ServiceAssemblies.CHANGE_STATE, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.CHANGE_STATE).toEqual(
        `[Service assemblies] Change state`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSa0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idSa0'],
    };

    it(`should change the isUpdatingState variable of an existing service-assembly to true`, () => {
      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.CHANGE_STATE,
          payload: { serviceAssemblyId: 'idSa0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
            isUpdatingState: true,
          },
        },
        allIds: ['idSa0'],
      });
    });
  });

  describe(ServiceAssemblies.CHANGE_STATE_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.CHANGE_STATE_SUCCESS).toEqual(
        `[Service assemblies] Change state success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSa0: {
          keepPreviousValues: '',
          errorChangeState: 'some previous error',
        },
      },
      allIds: ['idSa0'],
    };

    it(`should update an existing service-assembly by setting UI variables and the state`, () => {
      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.CHANGE_STATE_SUCCESS,
          payload: { serviceAssemblyId: 'idSa0', newState: 'Started' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
            isUpdatingState: false,
            state: 'Started',
            errorChangeState: '',
          },
        },
        allIds: ['idSa0'],
      });
    });
  });

  describe(ServiceAssemblies.CHANGE_STATE_ERROR, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.CHANGE_STATE_ERROR).toEqual(
        `[Service assemblies] Change state error`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSa0: {
          keepPreviousValues: '',
          errorChangeState: '',
        },
      },
      allIds: ['idSa0'],
    };

    it(`should change the isUpdatingState variable of an existing service-assembly to false`, () => {
      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.CHANGE_STATE_ERROR,
          payload: {
            serviceAssemblyId: 'idSa0',
            errorChangeState: 'some error',
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
            isUpdatingState: false,
            errorChangeState: 'some error',
          },
        },
        allIds: ['idSa0'],
      });
    });
  });

  describe(ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY, () => {
    it(`should check action name`, () => {
      expect(ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY).toEqual(
        `[Service assemblies] Remove service assembly`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idSa0: {
          keepPreviousValues: '',
        },
        idSa1: {
          keepPreviousValues: '',
        },
        idSa2: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idSa0', 'idSa1', 'idSa2'],
    };

    it(`should remove an existing service-assembly`, () => {
      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY,
          payload: { componentId: 'idComp0', serviceAssemblyId: 'idSa0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa1: {
            keepPreviousValues: '',
          },
          idSa2: {
            keepPreviousValues: '',
          },
        },
        allIds: ['idSa1', 'idSa2'],
      });

      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY,
          payload: { componentId: 'idComp0', serviceAssemblyId: 'idSa1' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
          },
          idSa2: {
            keepPreviousValues: '',
          },
        },
        allIds: ['idSa0', 'idSa2'],
      });

      expect(
        ServiceAssemblies.reducer(initialState, {
          type: ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY,
          payload: { componentId: 'idComp0', serviceAssemblyId: 'idSa2' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idSa0: {
            keepPreviousValues: '',
          },
          idSa1: {
            keepPreviousValues: '',
          },
        },
        allIds: ['idSa0', 'idSa1'],
      });
    });
  });

  describe(Workspaces.CLEAN_WORKSPACE, () => {
    it(`should return the initial value to reset the service-assemblies`, () => {
      const initialState: any = {
        doNotKeepPreviousValues: '',
        byId: {
          doNotKeepPreviousValues: '',
          idSa0: {
            doNotKeepPreviousValues: '',
          },
        },
        allIds: ['idSa0'],
      };

      expect(
        ServiceAssemblies.reducer(undefined, {
          type: Workspaces.CLEAN_WORKSPACE,
          payload: { noMatter: 'which payload !' },
        })
      ).toEqual(serviceAssembliesTableFactory());

      expect(
        ServiceAssemblies.reducer(initialState, {
          type: Workspaces.CLEAN_WORKSPACE,
          payload: { noMatter: 'which payload !' },
        })
      ).toEqual(serviceAssembliesTableFactory());
    });
  });
});
