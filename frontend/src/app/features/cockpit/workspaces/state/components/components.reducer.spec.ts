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
import { type } from 'app/shared/helpers/shared.helper';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.reducer';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { componentsTableFactory } from 'app/features/cockpit/workspaces/state/components/components.interface';

describe(`Components reducer`, () => {
  it(`should have a default value`, () => {
    expect(Components.reducer(undefined, { type: `init`, payload: `` }))
      .toEqual({
        selectedComponentId: '',
        isFetchingDetails: false,

        byId: {},
        allIds: []
      });
  });

  describe(type(Components.FETCH_COMPONENTS_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Components.FETCH_COMPONENTS_SUCCESS).toEqual(`COMPONENTS_REDUCER_FETCH_COMPONENTS_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          doNotKeepPreviousValuesIfUpdate: '',
          name: 'Comp 0',
          serviceUnits: [
            'idSu0',
            'idSu1'
          ],
          id: 'idComp0'
        },
        idComp1: {
          doNotKeepPreviousValuesIfUpdate: '',
          name: 'Comp 1',
          serviceUnits: [
            'idSu2',
            'idSu3'
          ],
          id: 'idComp1'
        }
      },
      allIds: [
        'idComp0',
        'idComp1'
      ]
    };

    it(`should replace a component if already existing (not update)`, () => {
      expect(Components.reducer(initialState, {
        type: Components.FETCH_COMPONENTS_SUCCESS,
        payload: {
          byId: {
            idComp0: {
              name: 'Comp 0 updated name',
              serviceUnits: [
                'idSu0A',
                'idSu1A'
              ],
              id: 'idComp0'
            },
            idComp1: {
              name: 'Comp 1 updated name',
              serviceUnits: [
                'idSu2A',
                'idSu3A'
              ],
              id: 'idComp1'
            }
          },
          allIds: [
            'idComp0',
            'idComp1'
          ]
        }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            name: 'Comp 0 updated name',
            serviceUnits: [
              'idSu0A',
              'idSu1A'
            ],
            id: 'idComp0',
            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false
          },
          idComp1: {
            name: 'Comp 1 updated name',
            serviceUnits: [
              'idSu2A',
              'idSu3A'
            ],
            id: 'idComp1',
            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false
          }
        },
        allIds: [
          'idComp0',
          'idComp1'
        ]
      });
    });

    it(`should add a component if doesn't exists yet`, () => {
      expect(Components.reducer(initialState, {
        type: Components.FETCH_COMPONENTS_SUCCESS,
        payload: {
          byId: {
            idComp2: {
              name: 'Comp 2',
              serviceUnits: [
                'idSu4',
                'idSu5'
              ],
              id: 'idComp2'
            },
            idComp3: {
              name: 'Comp 3',
              serviceUnits: [
                'idSu6',
                'idSu7'
              ],
              id: 'idComp3'
            }
          },
          allIds: [
            'idComp2',
            'idComp3'
          ]
        }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            doNotKeepPreviousValuesIfUpdate: '',
            name: 'Comp 0',
            serviceUnits: [
              'idSu0',
              'idSu1'
            ],
            id: 'idComp0'
          },
          idComp1: {
            doNotKeepPreviousValuesIfUpdate: '',
            name: 'Comp 1',
            serviceUnits: [
              'idSu2',
              'idSu3'
            ],
            id: 'idComp1'
          },
          idComp2: {
            name: 'Comp 2',
            serviceUnits: [
              'idSu4',
              'idSu5'
            ],
            id: 'idComp2',
            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false
          },
          idComp3: {
            name: 'Comp 3',
            serviceUnits: [
              'idSu6',
              'idSu7'
            ],
            id: 'idComp3',
            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false
          }
        },
        allIds: [
          'idComp0',
          'idComp1',
          'idComp2',
          'idComp3'
        ]
      });
    });
  });

  describe(type(Components.FOLD_COMPONENT), () => {
    it(`should check action name`, () => {
      expect(Components.FOLD_COMPONENT).toEqual(`COMPONENTS_REDUCER_FOLD_COMPONENT`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idComp0']
    };

    it(`should return the same object if ID doesn't exists`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.FOLD_COMPONENT,
        payload: { componentId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should fold an existing component`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.FOLD_COMPONENT,
        payload: { componentId: 'idComp0' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idComp0']
      });
    });

    it(`should return the same object when trying to fold a component already folded`, () => {
      const initialState2: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: { isFolded: true }
        },
        allIds: ['idComp0']
      };

      const reducer = Components.reducer(initialState2, {
        type: Components.FOLD_COMPONENT,
        payload: { componentId: 'idComp0' }
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(type(Components.UNFOLD_COMPONENT), () => {
    it(`should check action name`, () => {
      expect(Components.UNFOLD_COMPONENT).toEqual(`COMPONENTS_REDUCER_UNFOLD_COMPONENT`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          isFolded: false
        }
      },
      allIds: ['idComp0']
    };

    it(`should return the same object when trying to unfold an unknown component`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.UNFOLD_COMPONENT,
        payload: { componentId: 'unknown' }
      });

      expect(reducer).toBe(initialState);

      const initialState2: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idComp0']
      };

      const reducer2 = Components.reducer(initialState2, {
        type: Components.UNFOLD_COMPONENT,
        payload: { componentId: 'unknown' }
      });

      expect(reducer2).toBe(initialState2);
    });

    it(`should unfold an existing component`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.UNFOLD_COMPONENT,
        payload: { componentId: 'idComp0' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idComp0']
      });
    });

    it(`should return the same object when trying to unfold an already unfolded component`, () => {
      const initialState2: any = {
        byId: {
          idComp0: {
            isFolded: false
          }
        },
        allIds: ['idComp0']
      };

      const reducer = Components.reducer(initialState2, {
        type: Components.UNFOLD_COMPONENT,
        payload: { componentId: 'idComp0' }
      });

      expect(reducer).toBe(initialState2);
    });
  });

  describe(type(Components.TOGGLE_FOLD_COMPONENT), () => {
    it(`should check action name`, () => {
      expect(Components.TOGGLE_FOLD_COMPONENT).toEqual(`COMPONENTS_REDUCER_TOGGLE_FOLD_COMPONENT`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          isFolded: true
        }
      },
      allIds: ['idComp0']
    };

    it(`should return the same object when trying to toggle an unknown ID`, () => {
      const reducer = Components.reducer(initialState, {
        type: Components.TOGGLE_FOLD_COMPONENT,
        payload: { componentId: 'unknown' }
      });

      expect(reducer).toBe(initialState);
    });

    it(`should toggle from true to false`, () => {
      const reducer2 = Components.reducer(initialState, {
        type: Components.TOGGLE_FOLD_COMPONENT,
        payload: { componentId: 'idComp0' }
      });

      expect(reducer2).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idComp0']
      });
    });

    it(`should toggle from false to true`, () => {
      const initialState2: any = {
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: false
          }
        },
        allIds: ['idComp0']
      };

      const reducer = Components.reducer(initialState2, {
        type: Components.TOGGLE_FOLD_COMPONENT,
        payload: { componentId: 'idComp0' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFolded: true
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.SET_CURRENT_COMPONENT), () => {
    it(`should check action name`, () => {
      expect(Components.SET_CURRENT_COMPONENT).toEqual(`COMPONENTS_REDUCER_SET_CURRENT_COMPONENT`);
    });

    it(`should set the current component`, () => {
      const initialState: any = {
        keepPreviousValues: '',
        selectedComponentId: ''
      };

      // setting the current component to an unknown component (so far) should work
      // because we'll be trying to fetch that component right after
      const reducer = Components.reducer(initialState, {
        type: Components.SET_CURRENT_COMPONENT,
        payload: { componentId: 'unknown' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        selectedComponentId: 'unknown'
      });
    });
  });

  describe(type(Components.FETCH_COMPONENT_DETAILS), () => {
    it(`should check action name`, () => {
      expect(Components.FETCH_COMPONENT_DETAILS).toEqual(`COMPONENTS_REDUCER_FETCH_COMPONENT_DETAILS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idComp0']
    };

    it(`should set isFetchingDetails to true even if isFetchingDetails doesn't exists yet`, () => {
      expect(Components.reducer(initialState, {
        type: Components.FETCH_COMPONENT_DETAILS,
        payload: { componentId: 'idComp0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFetchingDetails: true
          },
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.FETCH_COMPONENT_DETAILS_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Components.FETCH_COMPONENT_DETAILS_SUCCESS).toEqual(`COMPONENTS_REDUCER_FETCH_COMPONENT_DETAILS_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
        }
      },
      allIds: ['idComp0']
    };

    it(`should set isFetchingDetails to false even if isFetchingDetails doesn't exists yet`, () => {
      expect(Components.reducer(initialState, {
        type: Components.FETCH_COMPONENT_DETAILS_SUCCESS,
        payload: { componentId: 'idComp0', data: { someData: 'some data' } }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFetchingDetails: false,
            someData: 'some data'
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.FETCH_COMPONENT_DETAILS_ERROR), () => {
    it(`should check action name`, () => {
      expect(Components.FETCH_COMPONENT_DETAILS_ERROR).toEqual(`COMPONENTS_REDUCER_FETCH_COMPONENT_DETAILS_ERROR`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          isFetchingDetails: true
        }
      },
      allIds: ['idComp0']
    };

    it(`should set isFetchingDetails to false if the component exists`, () => {
      expect(Components.reducer(initialState, {
        type: Components.FETCH_COMPONENT_DETAILS_ERROR,
        payload: { componentId: 'idComp0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isFetchingDetails: false
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.CHANGE_STATE), () => {
    it(`should check action name`, () => {
      expect(Components.CHANGE_STATE).toEqual(`COMPONENTS_REDUCER_CHANGE_STATE`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idComp0']
    };

    it(`should change the isUpdatingState variable of an existing component to true`, () => {
      expect(Components.reducer(initialState, {
        type: Components.CHANGE_STATE,
        payload: { componentId: 'idComp0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isUpdatingState: true
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.CHANGE_STATE_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Components.CHANGE_STATE_SUCCESS).toEqual(`COMPONENTS_REDUCER_CHANGE_STATE_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idComp0']
    };

    it(`should update an existing component by setting UI variables and the state`, () => {
      expect(Components.reducer(initialState, {
        type: Components.CHANGE_STATE_SUCCESS,
        payload: { componentId: 'idComp0', newState: 'Started' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isUpdatingState: false,
            state: 'Started'
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.CHANGE_STATE_ERROR), () => {
    it(`should check action name`, () => {
      expect(Components.CHANGE_STATE_ERROR).toEqual(`COMPONENTS_REDUCER_CHANGE_STATE_ERROR`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idComp0']
    };

    it(`should change the isUpdatingState variable of an existing component to false`, () => {
      expect(Components.reducer(initialState, {
        type: Components.CHANGE_STATE_ERROR,
        payload: { componentId: 'idComp0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isUpdatingState: false
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.REMOVE_COMPONENT), () => {
    it(`should check action name`, () => {
      expect(Components.REMOVE_COMPONENT).toEqual(`COMPONENTS_REDUCER_REMOVE_COMPONENT`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: ''
        },
        idComp1: {
          keepPreviousValues: ''
        },
        idComp2: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idComp0', 'idComp1', 'idComp2']
    };

    it(`should remove an existing component`, () => {
      expect(Components.reducer(initialState, {
        type: Components.REMOVE_COMPONENT,
        payload: { componentId: 'idComp0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp1: {
            keepPreviousValues: ''
          },
          idComp2: {
            keepPreviousValues: ''
          }
        },
        allIds: ['idComp1', 'idComp2']
      });

      expect(Components.reducer(initialState, {
        type: Components.REMOVE_COMPONENT,
        payload: { componentId: 'idComp1' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: ''
          },
          idComp2: {
            keepPreviousValues: ''
          }
        },
        allIds: ['idComp0', 'idComp2']
      });

      expect(Components.reducer(initialState, {
        type: Components.REMOVE_COMPONENT,
        payload: { componentId: 'idComp2' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: ''
          },
          idComp1: {
            keepPreviousValues: ''
          }
        },
        allIds: ['idComp0', 'idComp1']
      });
    });
  });

  describe(type(Components.DEPLOY_SERVICE_UNIT), () => {
    it(`should check action name`, () => {
      expect(Components.DEPLOY_SERVICE_UNIT).toEqual(`COMPONENTS_REDUCER_DEPLOY_SERVICE_UNIT`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: ''
        }
      },
      allIds: ['idComp0']
    };

    it(`should set the isDeployingServiceUnit variable to true for an existing component`, () => {
      expect(Components.reducer(initialState, {
        type: Components.DEPLOY_SERVICE_UNIT,
        payload: { componentId: 'idComp0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isDeployingServiceUnit: true
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.DEPLOY_SERVICE_UNIT_ERROR), () => {
    it(`should check action name`, () => {
      expect(Components.DEPLOY_SERVICE_UNIT_ERROR).toEqual(`COMPONENTS_REDUCER_DEPLOY_SERVICE_UNIT_ERROR`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          isDeployingServiceUnit: true
        }
      },
      allIds: ['idComp0']
    };

    it(`should set the isDeployingServiceUnit variable to false for an existing component`, () => {
      expect(Components.reducer(initialState, {
        type: Components.DEPLOY_SERVICE_UNIT_ERROR,
        payload: { componentId: 'idComp0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isDeployingServiceUnit: false
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(Components.DEPLOY_SERVICE_UNIT_SUCCESS), () => {
    it(`should check action name`, () => {
      expect(Components.DEPLOY_SERVICE_UNIT_SUCCESS).toEqual(`COMPONENTS_REDUCER_DEPLOY_SERVICE_UNIT_SUCCESS`);
    });

    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          serviceUnits: ['idSu0']
        }
      },
      allIds: ['idComp0']
    };

    it(`should set the isDeployingServiceUnit variable to false for an existing component and update the component`, () => {
      expect(Components.reducer(initialState, {
        type: Components.DEPLOY_SERVICE_UNIT_SUCCESS,
        payload: {
          componentId: 'idComp0',
          serviceUnit: {
            id: 'idSuNew',
            name: 'New Su',
            state: 'Started'
          }
        }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            isDeployingServiceUnit: false,
            serviceUnits: ['idSu0', 'idSuNew']
          }
        },
        allIds: ['idComp0']
      });
    });
  });

  describe(type(ServiceUnits.REMOVE_SERVICE_UNIT), () => {
    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          keepPreviousValues: '',
          id: 'idComp0',
          serviceUnits: ['idSu0', 'idSu1']
        },
        idComp1: {
          keepPreviousValues: '',
          id: 'idComp1',
          serviceUnits: ['idSu2', 'idSu3']
        }
      },
      allIds: ['idComp0', 'idComp1']
    };

    it(`should remove the service-unit from it's component if the service-unit belongs to a component`, () => {
      const reducer = Components.reducer(initialState, {
        type: ServiceUnits.REMOVE_SERVICE_UNIT,
        payload: { serviceUnitId: 'idSu1' }
      });

      expect(reducer).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            id: 'idComp0',
            serviceUnits: ['idSu0']
          },
          idComp1: {
            keepPreviousValues: '',
            id: 'idComp1',
            serviceUnits: ['idSu2', 'idSu3']
          }
        },
        allIds: ['idComp0', 'idComp1']
      });

      expect(Components.reducer(reducer, {
        type: ServiceUnits.REMOVE_SERVICE_UNIT,
        payload: { serviceUnitId: 'idSu0' }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            keepPreviousValues: '',
            id: 'idComp0',
            serviceUnits: []
          },
          idComp1: {
            keepPreviousValues: '',
            id: 'idComp1',
            serviceUnits: ['idSu2', 'idSu3']
          }
        },
        allIds: ['idComp0', 'idComp1']
      });
    });

    it(`should return the same object if the service-unit doesn't belong to any component`, () => {
      expect(Components.reducer(initialState, {
        type: ServiceUnits.REMOVE_SERVICE_UNIT,
        payload: { serviceUnitId: 'unknownSuId' }
      })).toBe(initialState);
    });
  });

  describe(`CONTAINERS_REDUCER_DEPLOY_COMPONENT_SUCCESS`, () => {
    const initialState: any = {
      keepPreviousValues: '',
      byId: {
        keepPreviousValues: '',
        idComp0: {
          doNotKeepPreviousValuesIfUpdate: ''
        }
      },
      allIds: ['idComp0']
    };

    it(`should add a non existing component`, () => {
      expect(Components.reducer(initialState, {
        type: 'CONTAINERS_REDUCER_DEPLOY_COMPONENT_SUCCESS',
        payload: {
          component: {
            id: 'idComp1',
            name: 'Comp 1',
            state: 'Unloaded'
          }
        }
      })).toEqual({
        keepPreviousValues: '',
        byId: {
          keepPreviousValues: '',
          idComp0: {
            doNotKeepPreviousValuesIfUpdate: ''
          },
          idComp1: {
            id: 'idComp1',
            name: 'Comp 1',
            state: 'Unloaded',
            serviceUnits: [],

            isFolded: false,
            isFetchingDetails: false,
            isUpdatingState: false,
            isDeployingServiceUnit: false
          }
        },
        allIds: ['idComp0', 'idComp1']
      });
    });
  });

  describe(type(Workspaces.CLEAN_WORKSPACE), () => {
    it(`should return the initial value to reset the containers`, () => {
      const initialState: any = {
        byId: {
          idComp0: {}
        },
        allIds: ['idComp0']
      };

      expect(Components.reducer(undefined, { type: Workspaces.CLEAN_WORKSPACE, payload: { noMatter: 'which payload !' } }))
        .toEqual(componentsTableFactory());

      expect(Components.reducer(initialState, { type: Workspaces.CLEAN_WORKSPACE, payload: { noMatter: 'which payload !' } }))
        .toEqual(componentsTableFactory());
    });
  });
});
