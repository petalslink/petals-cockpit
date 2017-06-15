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

import { Components } from 'app/features/cockpit/workspaces/state/components/components.reducer';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.reducer';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { componentsTableFactory } from 'app/features/cockpit/workspaces/state/components/components.interface';

describe(`Components reducer`, () => {
  it(`should have a default value`, () => {
    expect(
      Components.reducer(undefined, { type: `init`, payload: `` })
    ).toEqual({
      selectedComponentId: '',
      isFetchingDetails: false,

      byId: {},
      allIds: [],
    });
  });

  describe(Components.FETCH_COMPONENTS_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Components.FETCH_COMPONENTS_SUCCESS).toEqual(
        `[Components] Fetch components success`
      );
    });

    it(`should add one component`, () => {
      const reducer = Components.reducer(undefined, {
        type: Components.FETCH_COMPONENTS_SUCCESS,
        payload: {
          byId: {
            idComp1: {
              name: 'Comp 1',
              serviceUnits: ['idSu2A', 'idSu3A'],
              sharedLibraries: [],
              id: 'idComp1',
              containerId: 'idCont0',
              state: 'Started',
              type: 'BC',
            },
          },
          allIds: ['idComp1'],
        },
      });

      expect(reducer).toEqual({
        selectedComponentId: '',
        isFetchingDetails: false,
        byId: {
          idComp1: {
            name: 'Comp 1',
            serviceUnits: ['idSu2A', 'idSu3A'],
            sharedLibraries: [],
            id: 'idComp1',
            containerId: 'idCont0',
            state: 'Started',
            type: 'BC',
            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false,
            parameters: {},
            errorChangeState: '',
            errorDeployment: '',
          },
        },
        allIds: ['idComp1'],
      });
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          doNotKeepPreviousValuesIfUpdate: '',
          name: 'Comp 0',
          serviceUnits: ['idSu0', 'idSu1'],
          id: 'idComp0',
        },
        idComp1: {
          keepPreviousValues: '',
          name: 'Comp 1',
          serviceUnits: ['idSu2', 'idSu3'],
          id: 'idComp1',
        },
      },
      allIds: ['idComp0', 'idComp1'],
    };

    it(`should replace existing components while keeping extra values`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.FETCH_COMPONENTS_SUCCESS,
          payload: {
            byId: {
              idComp1: {
                name: 'Comp 1 updated name',
                serviceUnits: ['idSu2A', 'idSu3A'],
                sharedLibraries: ['idSL1'],
                id: 'idComp1',
                containerId: 'idCont0',
                state: 'Started',
                type: 'BC',
              },
            },
            allIds: ['idComp1'],
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          idComp1: {
            keepPreviousValues: '',
            name: 'Comp 1 updated name',
            serviceUnits: ['idSu2A', 'idSu3A'],
            sharedLibraries: ['idSL1'],
            id: 'idComp1',
            containerId: 'idCont0',
            state: 'Started',
            type: 'BC',
            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false,
            parameters: {},
            errorChangeState: '',
            errorDeployment: '',
          },
        },
        allIds: ['idComp1'],
      });
    });
  });

  describe(Components.ADD_COMPONENTS_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Components.ADD_COMPONENTS_SUCCESS).toEqual(
        `[Components] Add components success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          doNotKeepPreviousValuesIfUpdate: '',
          name: 'Comp 0',
          serviceUnits: ['idSu0', 'idSu1'],
          id: 'idComp0',
        },
        idComp1: {
          keepPreviousValues: '',
          name: 'Comp 1',
          serviceUnits: ['idSu2', 'idSu3'],
          id: 'idComp1',
        },
      },
      allIds: ['idComp0', 'idComp1'],
    };

    it(`should add a component if doesn't exists yet`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.ADD_COMPONENTS_SUCCESS,
          payload: {
            byId: {
              idComp2: {
                name: 'Comp 2',
                serviceUnits: ['idSu4', 'idSu5'],
                id: 'idComp2',
                containerId: 'idCont0',
                state: 'Started',
                type: 'BC',
              },
              idComp3: {
                name: 'Comp 3',
                serviceUnits: ['idSu6', 'idSu7'],
                id: 'idComp3',
                containerId: 'idCont0',
                state: 'Started',
                type: 'BC',
              },
            },
            allIds: ['idComp2', 'idComp3'],
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            doNotKeepPreviousValuesIfUpdate: '',
            name: 'Comp 0',
            serviceUnits: ['idSu0', 'idSu1'],
            id: 'idComp0',
          },
          idComp1: {
            keepPreviousValues: '',
            name: 'Comp 1',
            serviceUnits: ['idSu2', 'idSu3'],
            id: 'idComp1',
          },
          idComp2: {
            name: 'Comp 2',
            serviceUnits: ['idSu4', 'idSu5'],
            sharedLibraries: [],
            id: 'idComp2',
            containerId: 'idCont0',
            state: 'Started',
            type: 'BC',
            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false,
            parameters: {},
            errorChangeState: '',
            errorDeployment: '',
          },
          idComp3: {
            name: 'Comp 3',
            serviceUnits: ['idSu6', 'idSu7'],
            sharedLibraries: [],
            id: 'idComp3',
            containerId: 'idCont0',
            state: 'Started',
            type: 'BC',
            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false,
            parameters: {},
            errorChangeState: '',
            errorDeployment: '',
          },
        },
        allIds: ['idComp0', 'idComp1', 'idComp2', 'idComp3'],
      });
    });
  });

  describe(Components.FOLD_COMPONENT, () => {
    it(`should check action name`, () => {
      expect(Components.FOLD_COMPONENT).toEqual(`[Components] Fold component`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idComp0'],
    };

    it(`should return the same object if ID doesn't exists`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.FOLD_COMPONENT,
        payload: { componentId: 'unknown' },
      });

      expect(reducer).toBe(initialState);
    });

    it(`should fold an existing component`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.FOLD_COMPONENT,
        payload: { componentId: 'idComp0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: true,
          },
        },
        allIds: ['idComp0'],
      });
    });

    it(`should return the same object when trying to fold a component already folded`, () => {
      const initialState2: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: { isFolded: true },
        },
        allIds: ['idComp0'],
      };

      const reducer = Components.reducer(initialState2, {
        type: Components.FOLD_COMPONENT,
        payload: { componentId: 'idComp0' },
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(Components.UNFOLD_COMPONENT, () => {
    it(`should check action name`, () => {
      expect(Components.UNFOLD_COMPONENT).toEqual(
        `[Components] Unfold component`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          isFolded: false,
        },
      },
      allIds: ['idComp0'],
    };

    it(`should return the same object when trying to unfold an unknown component`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.UNFOLD_COMPONENT,
        payload: { componentId: 'unknown' },
      });

      expect(reducer).toBe(initialState);

      const initialState2: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: true,
          },
        },
        allIds: ['idComp0'],
      };

      const reducer2 = Components.reducer(initialState2, {
        type: Components.UNFOLD_COMPONENT,
        payload: { componentId: 'unknown' },
      });

      expect(reducer2).toBe(initialState2);
    });

    it(`should unfold an existing component`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.UNFOLD_COMPONENT,
        payload: { componentId: 'idComp0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: false,
          },
        },
        allIds: ['idComp0'],
      });
    });

    it(`should return the same object when trying to unfold an already unfolded component`, () => {
      const initialState2: any = {
        byId: {
          idComp0: {
            isFolded: false,
          },
        },
        allIds: ['idComp0'],
      };

      const reducer = Components.reducer(initialState2, {
        type: Components.UNFOLD_COMPONENT,
        payload: { componentId: 'idComp0' },
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(Components.TOGGLE_FOLD_COMPONENT, () => {
    it(`should check action name`, () => {
      expect(Components.TOGGLE_FOLD_COMPONENT).toEqual(
        `[Components] Toggle fold component`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          isFolded: true,
        },
      },
      allIds: ['idComp0'],
    };

    it(`should return the same object when trying to toggle an unknown ID`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.TOGGLE_FOLD_COMPONENT,
        payload: { componentId: 'unknown' },
      });

      expect(reducer).toBe(initialState);
    });

    it(`should toggle from true to false`, () => {
      const reducer2 = Components.reducer(initialState, {
        type: Components.TOGGLE_FOLD_COMPONENT,
        payload: { componentId: 'idComp0' },
      });

      expect(reducer2).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: false,
          },
        },
        allIds: ['idComp0'],
      });
    });

    it(`should toggle from false to true`, () => {
      const initialState2: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: false,
          },
        },
        allIds: ['idComp0'],
      };

      const reducer = Components.reducer(initialState2, {
        type: Components.TOGGLE_FOLD_COMPONENT,
        payload: { componentId: 'idComp0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: true,
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.SET_CURRENT_COMPONENT, () => {
    it(`should check action name`, () => {
      expect(Components.SET_CURRENT_COMPONENT).toEqual(
        `[Components] Set current component`
      );
    });

    it(`should set the current component and reset its errors`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedComponentId: '',
        byId: {
          idComp0: {
            errorDeployment: 'some deployment error',
            errorChangeState: 'some change state error',
          },
        },
      };

      const reducer = Components.reducer(initialState, {
        type: Components.SET_CURRENT_COMPONENT,
        payload: { componentId: 'idComp0' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedComponentId: 'idComp0',
        byId: {
          idComp0: { errorDeployment: '', errorChangeState: '' },
        },
      });
    });
  });

  describe(Components.FETCH_COMPONENT_DETAILS, () => {
    it(`should check action name`, () => {
      expect(Components.FETCH_COMPONENT_DETAILS).toEqual(
        `[Components] Fetch component details`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idComp0'],
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.FETCH_COMPONENT_DETAILS,
          payload: { componentId: 'idComp0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFetchingDetails: true,
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.FETCH_COMPONENT_DETAILS_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Components.FETCH_COMPONENT_DETAILS_SUCCESS).toEqual(
        `[Components] Fetch component details success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idComp0'],
    };

    it(`should set isFetchingDetails to false even if isFetchingDetails doesn't exists yet`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.FETCH_COMPONENT_DETAILS_SUCCESS,
          payload: { componentId: 'idComp0', data: { someData: 'some data' } },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
            someData: 'some data',
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.FETCH_COMPONENT_DETAILS_ERROR, () => {
    it(`should check action name`, () => {
      expect(Components.FETCH_COMPONENT_DETAILS_ERROR).toEqual(
        `[Components] Fetch component details error`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          isFetchingDetails: true,
        },
      },
      allIds: ['idComp0'],
    };

    it(`should set isFetchingDetails to false if the component exists`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.FETCH_COMPONENT_DETAILS_ERROR,
          payload: { componentId: 'idComp0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.CHANGE_STATE, () => {
    it(`should check action name`, () => {
      expect(Components.CHANGE_STATE).toEqual(`[Components] Change state`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idComp0'],
    };

    it(`should change the isUpdatingState variable of an existing component to true`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.CHANGE_STATE,
          payload: { componentId: 'idComp0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isUpdatingState: true,
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.CHANGE_STATE_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Components.CHANGE_STATE_SUCCESS).toEqual(
        `[Components] Change state success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idComp0'],
    };

    it(`should update an existing component by setting UI variables and the state`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.CHANGE_STATE_SUCCESS,
          payload: { componentId: 'idComp0', newState: 'Started' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isUpdatingState: false,
            state: 'Started',
            parameters: {},
            errorChangeState: '',
          },
        },
        allIds: ['idComp0'],
      });
    });

    it(`should update the parameters if any and set them to empty object otherwise`, () => {
      // without parameters
      expect(
        Components.reducer(initialState, {
          type: Components.CHANGE_STATE_SUCCESS,
          payload: { componentId: 'idComp0', newState: 'Shutdown' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isUpdatingState: false,
            state: 'Shutdown',
            parameters: {},
            errorChangeState: '',
          },
        },
        allIds: ['idComp0'],
      });

      // with parameters
      expect(
        Components.reducer(initialState, {
          type: Components.CHANGE_STATE_SUCCESS,
          payload: {
            componentId: 'idComp0',
            newState: 'Shutdown',
            parameters: { someParam: '' },
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isUpdatingState: false,
            state: 'Shutdown',
            parameters: { someParam: '' },
            errorChangeState: '',
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.CHANGE_STATE_ERROR, () => {
    it(`should check action name`, () => {
      expect(Components.CHANGE_STATE_ERROR).toEqual(
        `[Components] Change state error`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idComp0'],
    };

    it(`should change the isUpdatingState variable of an existing component to false`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.CHANGE_STATE_ERROR,
          payload: { componentId: 'idComp0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isUpdatingState: false,
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.REMOVE_COMPONENT, () => {
    it(`should check action name`, () => {
      expect(Components.REMOVE_COMPONENT).toEqual(
        `[Components] Remove component`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        },
        idComp1: {
          keepPreviousValues: '',
        },
        idComp2: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idComp0', 'idComp1', 'idComp2'],
    };

    it(`should remove an existing component`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.REMOVE_COMPONENT,
          payload: { containerId: 'idCont0', id: 'idComp0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp1: {
            keepPreviousValues: '',
          },
          idComp2: {
            keepPreviousValues: '',
          },
        },
        allIds: ['idComp1', 'idComp2'],
      });

      expect(
        Components.reducer(initialState, {
          type: Components.REMOVE_COMPONENT,
          payload: { containerId: 'idCont0', id: 'idComp1' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
          },
          idComp2: {
            keepPreviousValues: '',
          },
        },
        allIds: ['idComp0', 'idComp2'],
      });

      expect(
        Components.reducer(initialState, {
          type: Components.REMOVE_COMPONENT,
          payload: { containerId: 'idCont0', id: 'idComp2' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
          },
          idComp1: {
            keepPreviousValues: '',
          },
        },
        allIds: ['idComp0', 'idComp1'],
      });
    });
  });

  describe(Components.DEPLOY_SERVICE_UNIT, () => {
    it(`should check action name`, () => {
      expect(Components.DEPLOY_SERVICE_UNIT).toEqual(
        `[Components] Deploy service unit`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        },
      },
      allIds: ['idComp0'],
    };

    it(`should set the isDeployingServiceUnit variable to true for an existing component`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.DEPLOY_SERVICE_UNIT,
          payload: { componentId: 'idComp0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isDeployingServiceUnit: true,
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.DEPLOY_SERVICE_UNIT_ERROR, () => {
    it(`should check action name`, () => {
      expect(Components.DEPLOY_SERVICE_UNIT_ERROR).toEqual(
        `[Components] Deploy service unit error`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          isDeployingServiceUnit: true,
        },
      },
      allIds: ['idComp0'],
    };

    it(`should set the isDeployingServiceUnit variable to false for an existing component`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.DEPLOY_SERVICE_UNIT_ERROR,
          payload: { componentId: 'idComp0', errorDeployment: 'some error' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isDeployingServiceUnit: false,
            errorDeployment: 'some error',
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(Components.DEPLOY_SERVICE_UNIT_SUCCESS, () => {
    it(`should check action name`, () => {
      expect(Components.DEPLOY_SERVICE_UNIT_SUCCESS).toEqual(
        `[Components] Deploy service unit success`
      );
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          serviceUnits: ['idSu0'],
        },
      },
      allIds: ['idComp0'],
    };

    it(`should set the isDeployingServiceUnit variable to false for an existing component and update the component`, () => {
      expect(
        Components.reducer(initialState, {
          type: Components.DEPLOY_SERVICE_UNIT_SUCCESS,
          payload: {
            id: 'idSuNew',
            name: 'New Su',
            state: 'Started',
            componentId: 'idComp0',
          },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isDeployingServiceUnit: false,
            serviceUnits: ['idSu0', 'idSuNew'],
            errorDeployment: '',
          },
        },
        allIds: ['idComp0'],
      });
    });
  });

  describe(ServiceUnits.REMOVE_SERVICE_UNIT, () => {
    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          id: 'idComp0',
          serviceUnits: ['idSu0', 'idSu1'],
        },
        idComp1: {
          keepPreviousValues: '',
          id: 'idComp1',
          serviceUnits: ['idSu2', 'idSu3'],
        },
      },
      allIds: ['idComp0', 'idComp1'],
    };

    it(`should remove the service-unit from it's component if the service-unit belongs to a component`, () => {
      const reducer = Components.reducer(initialState, {
        type: ServiceUnits.REMOVE_SERVICE_UNIT,
        payload: { componentId: 'idComp0', serviceUnitId: 'idSu1' },
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            id: 'idComp0',
            serviceUnits: ['idSu0'],
          },
          idComp1: {
            keepPreviousValues: '',
            id: 'idComp1',
            serviceUnits: ['idSu2', 'idSu3'],
          },
        },
        allIds: ['idComp0', 'idComp1'],
      });

      expect(
        Components.reducer(reducer, {
          type: ServiceUnits.REMOVE_SERVICE_UNIT,
          payload: { componentId: 'idComp0', serviceUnitId: 'idSu0' },
        })
      ).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            id: 'idComp0',
            serviceUnits: [],
          },
          idComp1: {
            keepPreviousValues: '',
            id: 'idComp1',
            serviceUnits: ['idSu2', 'idSu3'],
          },
        },
        allIds: ['idComp0', 'idComp1'],
      });
    });
  });

  describe(Workspaces.CLEAN_WORKSPACE, () => {
    it(`should return the initial value to reset the containers`, () => {
      const initialState: any = {
        byId: {
          idComp0: {},
        },
        allIds: ['idComp0'],
      };

      expect(
        Components.reducer(undefined, {
          type: Workspaces.CLEAN_WORKSPACE,
          payload: { noMatter: 'which payload !' },
        })
      ).toEqual(componentsTableFactory());

      expect(
        Components.reducer(initialState, {
          type: Workspaces.CLEAN_WORKSPACE,
          payload: { noMatter: 'which payload !' },
        })
      ).toEqual(componentsTableFactory());
    });
  });
});
